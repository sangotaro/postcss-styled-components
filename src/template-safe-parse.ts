"use strict";

import { TemplateSafeParser } from "./template-safe-parser";

const Input = require("postcss/lib/input");

function templateSafeParse(css, opts) {
  const input = new Input(css, opts);

  input.quasis = opts.quasis;
  input.templateLiteralStyles = opts.templateLiteralStyles;
  input.parseOptions = opts;
  // @ts-expect-error TS2554: Expected 0 arguments, but got 1.
  const parser = new TemplateSafeParser(input);

  parser.parse();

  return parser.root;
}

module.exports = templateSafeParse;