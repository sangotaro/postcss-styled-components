"use strict";

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'reNewLine'... Remove this comment to see the full error message
// eslint-disable-next-line regexp/no-useless-non-capturing-group, regexp/no-useless-flag
const reNewLine = /(?:\r?\n|\r)/gm;
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Document'.
const Document = require("./document");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getSyntax'... Remove this comment to see the full error message
const getSyntax = require("./get-syntax");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Input'.
const Input = require("postcss/lib/input");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'patch'.
const patch = require("./patch-postcss");

// @ts-expect-error ts-migrate(2300) FIXME: Duplicate identifier 'LocalFixer'.
class LocalFixer {
  constructor(lines, style) {
    let line = 0;
    let column = style.startIndex;

    // eslint-disable-next-line array-callback-return
    lines.some((lineEndIndex, lineNumber) => {
      if (lineEndIndex >= style.startIndex) {
        line = lineNumber--;

        if (lineNumber in lines) {
          column = style.startIndex - lines[lineNumber] - 1;
        }

        return true;
      }
    });

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'line' does not exist on type 'LocalFixer... Remove this comment to see the full error message
    this.line = line;
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'column' does not exist on type 'LocalFix... Remove this comment to see the full error message
    this.column = column;
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'style' does not exist on type 'LocalFixe... Remove this comment to see the full error message
    this.style = style;
  }
  object(object) {
    if (object) {
      if (object.line === 1) {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'column' does not exist on type 'LocalFix... Remove this comment to see the full error message
        object.column += this.column;
      }

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'line' does not exist on type 'LocalFixer... Remove this comment to see the full error message
      object.line += this.line;
    }
  }
  node(node) {
    this.object(node.source.start);
    this.object(node.source.end);
  }
  root(root) {
    this.node(root);
    root.walk((node) => {
      this.node(node);
    });
  }
  error(error) {
    if (error && error.name === "CssSyntaxError") {
      this.object(error);
      this.object(error.input);
      error.message = error.message.replace(
        /:\d+:\d+:/,
        `:${error.line}:${error.column}:`
      );
    }

    return error;
  }
  parse(opts) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'style' does not exist on type 'LocalFixe... Remove this comment to see the full error message
    const style = this.style;
    const syntax = style.syntax || getSyntax(style.lang, opts);
    let root = style.root;

    try {
      root = syntax.parse(style.content, {
        ...opts,
        map: false,
        ...style.opts,
      });
    } catch (error) {
      if (style.ignoreErrors) {
        return;
      }

      if (!style.skipConvert) {
        this.error(error);
      }

      throw error;
    }

    if (!style.skipConvert) {
      this.root(root);
    }

    root.source.inline = Boolean(style.inline);
    root.source.lang = style.lang;
    root.source.syntax = syntax;

    return root;
  }
}

// @ts-expect-error TS2393: Duplicate function implementation.
function docFixer(source, opts) {
  let match;
  const lines = [];

  reNewLine.lastIndex = 0;
  while ((match = reNewLine.exec(source))) {
    lines.push(match.index);
  }
  lines.push(source.length);

  // eslint-disable-next-line no-shadow
  return function parseStyle(style) {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
    return new LocalFixer(lines, style).parse(opts);
  };
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'parseStyle... Remove this comment to see the full error message
function parseStyle(source, opts, styles) {
  patch(Document);

  const document = new Document();

  let index = 0;

  if (styles.length) {
    // eslint-disable-next-line no-shadow
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

          root.document = document;
          document.nodes.push(root);
        }
      });
  }

  document.raws.afterEnd = index ? source.slice(index) : source;
  document.source = {
    input: new Input(source, opts),
    start: {
      line: 1,
      column: 1,
    },
    opts,
  };

  return document;
}

module.exports = parseStyle;
