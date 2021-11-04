"use strict";

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Input'.
const Input = require("postcss/lib/input");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'TemplateSa... Remove this comment to see the full error message
const TemplateSafeParser = require("./template-safe-parser");

function templateSafeParse(css, opts) {
  const input = new Input(css, opts);

  input.quasis = opts.quasis;
  input.templateLiteralStyles = opts.templateLiteralStyles;
  input.parseOptions = opts;
  const parser = new TemplateSafeParser(input);

  parser.parse();

  return parser.root;
}

module.exports = templateSafeParse;
