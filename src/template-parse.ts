"use strict";

import { TemplateParser } from "./template-parser";

const Input = require("postcss/lib/input");

function templateParse(css, opts) {
  const input = new Input(css, opts);

  input.quasis = opts.quasis;
  input.templateLiteralStyles = opts.templateLiteralStyles;
  input.parseOptions = opts;
  // @ts-expect-error TS2554: Expected 0 arguments, but got 1
  const parser = new TemplateParser(input);

  parser.parse();

  return parser.root;
}

module.exports = templateParse;
