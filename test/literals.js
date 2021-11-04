"use strict";

const fs = require("fs");
const syntax = require("../dist");

describe("template literals", () => {
  it("template literals inside template literals", () => {
    const file = require.resolve("./fixtures/tpl-in-tpl.mjs");
    let code = fs.readFileSync(file);

    const document = syntax.parse(code, {
      from: file,
    });

    code = code.toString();
    expect(document.toString()).toBe(code);
    expect(document.source).toHaveProperty("lang", "jsx");

    expect(document.nodes).toHaveLength(1);
    expect(document.first.nodes).toHaveLength(1);

    document.first.nodes.forEach((decl) => {
      expect(decl).toHaveProperty("type", "decl");
      expect(decl).toHaveProperty("prop", "border-bottom");
      expect(decl).toHaveProperty(
        "value",
        '${(props) => (props.border ? `1px solid ${color}` : "0")}'
      );
    });
  });

  it("multiline arrow function", () => {
    const file = require.resolve("./fixtures/multiline-arrow-function.mjs");
    let code = fs.readFileSync(file);

    const document = syntax.parse(code, {
      from: file,
    });

    code = code.toString();
    expect(document.toString()).toBe(code);
    expect(document.source).toHaveProperty("lang", "jsx");

    expect(document.nodes).toHaveLength(1);
    expect(document.first.nodes).toHaveLength(1);

    document.first.nodes.forEach((decl) => {
      expect(decl).toHaveProperty("type", "decl");
      expect(decl).toHaveProperty("prop", "color");
      expect(decl).toHaveProperty(
        'value', // prettier-ignore
        [
          "${(props) =>",
          '(props.status === "signed" && "red") ||',
          '"blue"}',
        ].join("\n\t\t")
      );
    });
  });

  it("interpolation as the only content of a component", () => {
    const file = require.resolve("./fixtures/interpolation-content.mjs");
    let code = fs.readFileSync(file);

    const document = syntax.parse(code, {
      from: file,
    });

    code = code.toString();
    expect(document.toString()).toBe(code);
    expect(document.source).toHaveProperty("lang", "jsx");

    expect(document.nodes).toHaveLength(9);
    /* eslint-disable jest/no-conditional-expect -- in the current state, the related test fixture
     * is likely too complicated to resolve (up to 45 checks). we should consider different approaches
     * in the future. for more info, see https://github.com/stylelint/postcss-css-in-js/pull/80
     */
    document.nodes.forEach((root, i) => {
      switch (i) {
        case 0: {
          expect(root.nodes).toHaveLength(1);
          root.nodes.forEach((decl) => {
            expect(decl).toHaveProperty("type", "decl");
            expect(decl).toHaveProperty("prop", "display");
            expect(decl).toHaveProperty("value", "inline-block");
          });

          return;
        }
        case 1:
        case 2: {
          expect(root.nodes).toHaveLength(2);
          expect(root.first).toHaveProperty("type", "literal");
          expect(root.first).toHaveProperty("text", "${buttonStyles}");
          expect(root.last).toHaveProperty("type", "decl");
          expect(root.last).toHaveProperty("prop", "color");
          expect(root.last).toHaveProperty("value", "red");

          return;
        }
        case 3:
        case 4: {
          expect(root.nodes).toHaveLength(2);
          expect(root.first).toHaveProperty("type", "decl");
          expect(root.first).toHaveProperty("prop", "color");
          expect(root.first).toHaveProperty("value", "red");
          expect(root.last).toHaveProperty("type", "literal");
          expect(root.last).toHaveProperty("text", "${buttonStyles}");
        }
      }
    });
    /* eslint-enable jest/no-conditional-expect */
  });

  it("selector", () => {
    const file = require.resolve("./fixtures/tpl-selector.mjs");
    let code = fs.readFileSync(file);

    const document = syntax.parse(code, {
      from: file,
    });

    code = code.toString();
    expect(document.toString()).toBe(code);
    expect(document.source).toHaveProperty("lang", "jsx");

    expect(document.nodes).toHaveLength(1);
    expect(document.first.nodes).toHaveLength(6);
    document.first.nodes.forEach((rule) => {
      expect(rule).toHaveProperty("type", "rule");
      expect(rule).toHaveProperty("selector");
      expect(rule.selector).toMatch(/(?:^|\s)\$\{selector\}(?=,|\s|$)/);
    });
  });

  describe("decl", () => {
    const file = require.resolve("./fixtures/tpl-decl.mjs");
    const code = fs.readFileSync(file);

    syntax
      .parse(code, {
        from: file,
      })
      .first.nodes.forEach((rule) => {
        it(`${rule.selector}`, () => {
          expect(rule.nodes).toHaveLength(1);
          const decl = rule.first;

          expect(decl).toHaveProperty(
            "prop",
            /\bprop\b/.test(rule.selector)
              ? `${/\bprefix\b/.test(rule.selector) ? "prefix-" : ""}\${prop}${
                  /\bsuffix\b/.test(rule.selector) ? "-suffix" : ""
                }`
              : "prop"
          );
          expect(decl).toHaveProperty(
            "value",
            /\bvalue\b/.test(rule.selector)
              ? `${/\bprefix\b/.test(rule.selector) ? "prefix-" : ""}\${value}${
                  /\bsuffix\b/.test(rule.selector) ? "-suffix" : ""
                }`
              : "value"
          );
        });
      });
  });

  it("non-literals", () => {
    const file = require.resolve("./fixtures/tpl-special.mjs");
    let code = fs.readFileSync(file);

    const document = syntax.parse(code, {
      from: file,
    });

    code = code.toString();
    expect(document.toString()).toBe(code);
    expect(document.source).toHaveProperty("lang", "jsx");

    document.walk((node) => {
      expect(node).toHaveProperty("type");
      expect(node.type).not.toBe("literal");
    });
  });

  describe("template-safe-parse", () => {
    [
      "./fixtures/tpl-in-tpl.mjs",
      "./fixtures/multiline-arrow-function.mjs",
      "./fixtures/interpolation-content.mjs",
      "./fixtures/tpl-selector.mjs",
      "./fixtures/tpl-decl.mjs",
      "./fixtures/tpl-special.mjs",
    ].forEach((file) => {
      it(`${file}`, () => {
        file = require.resolve(file);
        const code = fs.readFileSync(file);

        expect(() =>
          syntax({
            css: "safe-parser",
          }).parse(code, {
            from: "styled-safe-parse.js",
          })
        ).not.toThrow();
      });
    });
  });
});
