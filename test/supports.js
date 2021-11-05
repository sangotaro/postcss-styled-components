"use strict";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const syntax = require("../dist");

function clean(node) {
  if (node.source) {
    node.source.input.file = path.basename(node.source.input.file);
  }

  delete node.document;

  if (node.nodes) {
    node.nodes = node.nodes.map(clean);
  }

  return node;
}

describe("should support for each CSS in JS package", () => {
  [
    "interpolation-content.mjs",
    "styled-components-nesting-expr.js",
    "styled-components-nesting.js",
    "styled-components-nesting2.js",
    "styled-components-nesting3.js",
    "styled-components-nesting-nesting.js",
    "styled-components-nesting-template-literal.js",
    "styled-components.js",
    "styled-props.jsx",
    "tpl-decl.mjs",
    "tpl-in-tpl.mjs",
    "tpl-selector.mjs",
    "tpl-special.mjs",
  ].forEach((file) => {
    it(`${file}`, () => {
      file = require.resolve(`./fixtures/${file}`);
      const code = fs.readFileSync(file);
      const document = syntax.parse(code, {
        from: file,
      });

      expect(document.source).toHaveProperty("lang", "jsx");
      expect(document.toString()).toBe(code.toString());
      expect(document.nodes.length).toBeGreaterThan(0);
      clean(document);
      const parsed = JSON.stringify(document.toJSON(), 0, "\t");

      // fs.writeFileSync(file + '.json', parsed + '\n');
      expect(parsed).toBe(fs.readFileSync(`${file}.json`, "utf8").trim());
    });
  });
});
