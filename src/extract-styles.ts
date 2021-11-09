import { loadOptions, parse, traverse, types } from "@babel/core";
import type { ParseResult, TransformOptions, Visitor } from "@babel/core";
import { ProcessOptions } from "postcss";

import { templateParse } from "./template-parse";
import { templateStringify } from "./template-stringify";

const supports = {
  "styled-components": true,
};

const plugins = [
  "jsx",
  "typescript",
  "objectRestSpread",
  ["decorators", { decoratorsBeforeExport: false }],
  "classProperties",
  "exportExtensions",
  "asyncGenerators",
  "functionBind",
  "functionSent",
  "dynamicImport",
  "optionalCatchBinding",
];

function loadBabelOpts(opts): TransformOptions {
  const filename = opts.from && opts.from.replace(/\?.*$/, "");

  opts = {
    filename,
    parserOpts: {
      plugins,
      sourceFilename: filename,
      sourceType:
        filename && /\.m[tj]sx?$/.test(filename) ? "module" : "unambiguous",
      allowImportExportEverywhere: true,
      allowAwaitOutsideFunction: true,
      allowReturnOutsideFunction: true,
      allowSuperOutsideMethod: true,
    },
  };
  let fileOpts;

  try {
    fileOpts =
      filename &&
      loadOptions({
        filename,
      });
  } catch (ex) {
    //
  }

  for (const key in fileOpts) {
    if (Array.isArray(fileOpts[key]) && !fileOpts[key].length) {
      continue;
    }

    opts[key] = fileOpts[key];

    if (Array.isArray(fileOpts[key]) && Array.isArray(opts.parserOpts[key])) {
      // combine arrays for plugins
      opts.parserOpts[key] = opts.parserOpts[key].concat(fileOpts[key]);
    } else {
      // because some options need to be passed to parser also
      opts.parserOpts[key] = fileOpts[key];
    }
  }

  return opts;
}

type CssStyle = {
  lang: "css";
  startIndex: number;
  endIndex: number;
  content: string;
};

type TemplateLiteralStyle = {
  lang: "template-literal";
  startIndex: number;
  endIndex: number;
  content: string;
  opts: {
    quasis: {
      start: number;
      end: number;
    }[];
    expressions: {
      start: number;
      end: number;
    }[];
    templateLiteralStyles: (TemplateLiteralStyle | CssStyle)[];
  };
  syntax: {
    parse: typeof templateParse;
    stringify: typeof templateStringify;
  };
};

export type Style = TemplateLiteralStyle | CssStyle;

function toStyle(source: string, node: types.TemplateLiteral): Style {
  const quasis = node.quasis.flatMap(({ start, end }) =>
    start != null && end != null ? [{ start, end }] : []
  );
  const startIndex = quasis[0].start;
  const endIndex = quasis[quasis.length - 1].end;

  if (node.expressions.length > 0) {
    const expressions = node.expressions.flatMap(({ start, end }) =>
      start != null && end != null ? [{ start, end }] : []
    );

    return {
      lang: "template-literal",
      startIndex,
      endIndex,
      content: source.slice(startIndex, endIndex),
      opts: {
        quasis,
        expressions,
        templateLiteralStyles: [],
      },
      syntax: {
        parse: templateParse,
        stringify: templateStringify,
      },
    };
  }

  return {
    lang: "css",
    startIndex,
    endIndex,
    content: source.slice(startIndex, endIndex),
  };
}

export function extractStyles(
  source: string,
  opts: Pick<ProcessOptions, "map" | "from">
): Style[] {
  let ast: ParseResult | null;

  try {
    ast = parse(source, loadBabelOpts(opts));
  } catch (ex) {
    return [];
  }

  const specifiers = new Map();
  const variableDeclarator = new Map();
  const templateLiterals = new Set<types.TemplateLiteral>();

  function setSpecifier(id, nameSpace) {
    nameSpace.unshift(
      ...nameSpace
        .shift()
        .replace(/^\W+/, "")
        .split(/[/\\]+/g)
    );

    if (types.isIdentifier(id)) {
      specifiers.set(id.name, nameSpace);
      specifiers.set(id, nameSpace);
    } else if (types.isObjectPattern(id)) {
      id.properties.forEach((property) => {
        if (types.isObjectProperty(property)) {
          const key = property.key;

          // @ts-expect-error  TS2339: Property 'name' does not exist on type 'Expression'.,  TS2339: Property 'value' does not exist on type 'Expression'.
          nameSpace = nameSpace.concat(key.name || key.value);
          id = property.value;
        } else {
          id = property.argument;
        }

        setSpecifier(id, nameSpace);
      });
    } else if (types.isArrayPattern(id)) {
      id.elements.forEach((element, i) => {
        setSpecifier(element, nameSpace.concat(String(i)));
      });
    }
  }

  function getNameSpace(path, nameSpace) {
    let node = path.node;

    if (path.isIdentifier() || path.isJSXIdentifier()) {
      node = path.scope.getBindingIdentifier(node.name) || node;
      const specifier = specifiers.get(node) || specifiers.get(node.name);

      if (specifier) {
        nameSpace.unshift(...specifier);
      } else {
        nameSpace.unshift(node.name);
      }
    } else {
      ["name", "property", "object", "callee"].forEach((prop) => {
        node[prop] && getNameSpace(path.get(prop), nameSpace);
      });
    }

    return nameSpace;
  }

  function isStylePath(path) {
    return getNameSpace(path, []).some(function (name, ...args) {
      const result =
        name &&
        Object.prototype.hasOwnProperty.call(supports, name) &&
        supports[name];

      switch (typeof result) {
        case "function": {
          return result.apply(this, args);
        }
        case "boolean": {
          return result;
        }
        default: {
          return undefined;
        }
      }
    });
  }

  const visitor: Visitor = {
    ImportDeclaration: (path) => {
      const moduleId = path.node.source.value;

      path.node.specifiers.forEach((specifier) => {
        const nameSpace = [moduleId];

        if (types.isImportSpecifier(specifier)) {
          if (types.isIdentifier(specifier.imported)) {
            nameSpace.push(specifier.imported.name);
          }
        }

        setSpecifier(specifier.local, nameSpace);
      });
    },
    VariableDeclarator: (path) => {
      variableDeclarator.set(
        path.node.id,
        path.node.init ? [path.get("init")] : []
      );
    },
    AssignmentExpression: (path) => {
      if (
        types.isIdentifier(path.node.left) &&
        types.isObjectExpression(path.node.right)
      ) {
        const identifier = path.scope.getBindingIdentifier(path.node.left.name);
        const variable = variableDeclarator.get(identifier);
        const valuePath = path.get("right");

        if (variable) {
          variable.push(valuePath);
        } else {
          variableDeclarator.set(identifier, [valuePath]);
        }
      }
    },
    CallExpression: (path) => {
      const callee = path.node.callee;

      if (
        types.isIdentifier(callee, { name: "require" }) &&
        !path.scope.getBindingIdentifier(callee.name)
      ) {
        path.node.arguments
          .flatMap((arg) => (types.isStringLiteral(arg) ? [arg] : []))
          .forEach((arg) => {
            const moduleId = arg.value;
            const nameSpace = [moduleId];
            let currentPath = path;

            do {
              // @ts-expect-error TS2339: Property 'id' does not exist on type 'Node'.
              let id = currentPath.parent.id;

              if (!id) {
                // @ts-expect-error TS2339: Property 'left' does not exist on type 'Node'.
                id = currentPath.parent.left;

                if (id) {
                  id = path.scope.getBindingIdentifier(id.name) || id;
                } else {
                  // @ts-expect-error TS2339: Property 'property' does not exist on type 'Node'.
                  if (types.isIdentifier(currentPath.parent.property)) {
                    // @ts-expect-error TS2339: Property 'property' does not exist on type 'Node'.
                    nameSpace.push(currentPath.parent.property.name);
                  }

                  // @ts-expect-error TS2322: Type 'NodePath<Node>' is not assignable to type 'NodePath<CallExpression>'.
                  currentPath = currentPath.parentPath;
                  continue;
                }
              }

              setSpecifier(id, nameSpace);
              break;
            } while (currentPath);
          });
      }
    },
    TaggedTemplateExpression: (path) => {
      if (isStylePath(path.get("tag"))) {
        templateLiterals.add(path.node.quasi);
      }
    },
  };

  traverse(ast, visitor);

  const styles: Style[] = [];

  for (const node of templateLiterals) {
    const style = toStyle(source, node);

    let parent: TemplateLiteralStyle;
    let targetStyles = styles;

    while (targetStyles) {
      const target = targetStyles.flatMap((targetStyle) =>
        targetStyle.lang === "template-literal" &&
        targetStyle.opts.expressions.some(
          (expression) =>
            expression.start <= style.startIndex &&
            style.endIndex < expression.end
        )
          ? [targetStyle]
          : []
      )[0];

      if (target) {
        parent = target;
        targetStyles = target.opts.templateLiteralStyles;
      } else {
        break;
      }
    }

    if (parent) {
      parent.opts.templateLiteralStyles.push(style);
    } else {
      styles.push(style);
    }
  }

  return styles;
}
