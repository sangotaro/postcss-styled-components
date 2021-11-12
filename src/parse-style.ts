import type { ProcessOptions, ChildNode, Position } from "postcss";
import CssSyntaxError from "postcss/lib/css-syntax-error";
import Input, { FilePosition } from "postcss/lib/input";
import defaultParse from "postcss/lib/parse";
import Root from "postcss/lib/root";
import defaultStringify from "postcss/lib/stringify";

import { Document } from "./document";
import { extractStyles, Style } from "./extract-styles";
import { patch } from "./patch-postcss";

const defaultSyntax = {
  parse: defaultParse,
  stringify: defaultStringify,
};

// eslint-disable-next-line regexp/no-useless-non-capturing-group, regexp/no-useless-flag
const reNewLine = /(?:\r?\n|\r)/gm;

class LocalFixer {
  private readonly line: number;
  private readonly column: number;
  private readonly style: Style;

  constructor(lineEndIndexes: number[], style: Style) {
    let line = 0;
    let column = style.startIndex;

    lineEndIndexes.some((lineEndIndex, lineNumber) => {
      if (lineEndIndex >= style.startIndex) {
        line = lineNumber--;

        if (lineNumber in lineEndIndexes) {
          column = style.startIndex - lineEndIndexes[lineNumber] - 1;
        }

        return true;
      }

      return false;
    });

    this.line = line;
    this.column = column;
    this.style = style;
  }
  object(object: Position | FilePosition | CssSyntaxError) {
    if (object) {
      if (object.line === 1) {
        object.column += this.column;
      }

      object.line += this.line;
    }
  }
  node(node: Root | ChildNode) {
    this.object(node.source.start);
    this.object(node.source.end);
  }
  root(root: Root) {
    this.node(root);
    root.walk((node) => {
      this.node(node);
    });
  }
  error(error: unknown) {
    if (error instanceof CssSyntaxError) {
      this.object(error);
      this.object(error.input);
      error.message = error.message.replace(
        /:\d+:\d+:/,
        `:${error.line}:${error.column}:`
      );
    }

    return error;
  }
  parse(opts: Pick<ProcessOptions, "map" | "from">) {
    const style = this.style;
    let root: Root;

    try {
      if (style.lang === "template-literal") {
        root = style.syntax.parse(style.content, {
          ...opts,
          map: false,
          ...style.opts,
        });
        root.source.syntax = style.syntax;
      } else {
        root = defaultSyntax.parse(style.content, { ...opts, map: false });
        root.source.syntax = defaultSyntax;
      }

      // Note:
      // Stylelint is using inline and lang property.
      root.source.inline = false;
      root.source.lang = style.lang;
    } catch (error) {
      this.error(error);

      throw error;
    }

    this.root(root);

    return root;
  }
}

function docFixer(source: string, opts: Pick<ProcessOptions, "map" | "from">) {
  let match: RegExpExecArray | null;
  const lineEndIndexes: number[] = [];

  reNewLine.lastIndex = 0;
  while ((match = reNewLine.exec(source))) {
    lineEndIndexes.push(match.index);
  }
  lineEndIndexes.push(source.length);

  return function parseStyle(style: Style) {
    return new LocalFixer(lineEndIndexes, style).parse(opts);
  };
}

export function parseStyle(
  source: string,
  opts: Pick<ProcessOptions, "map" | "from">
) {
  patch(Document);

  const document = new Document();
  const styles = extractStyles(source, opts);
  let index = 0;

  if (styles.length > 0) {
    const parseStyle = docFixer(source, opts);

    styles
      .sort((a, b) => a.startIndex - b.startIndex)
      .forEach((style) => {
        const root = parseStyle(style);

        if (root) {
          root.raws.beforeStart = source.slice(index, style.startIndex);

          if (style.endIndex) {
            index = style.endIndex;
          } else {
            index =
              style.startIndex +
              (style.content || root.source.input.css).length;
          }

          // @ts-expect-error TS2339: Property 'document' does not exist on type 'Root'.
          root.document = document;
          // @ts-expect-error TS2345: Argument of type 'Root' is not assignable to parameter of type 'ChildNode'.
          document.nodes.push(root);
        }
      });
  }

  document.raws.afterEnd = index ? source.slice(index) : source;
  document.source = {
    input: new Input(source, opts),
    // @ts-expect-error TS2741: Property 'offset' is missing in type '{ line: number; column: number; }' but required in type 'Position'.
    start: {
      line: 1,
      column: 1,
    },
    opts,
  };

  return document;
}
