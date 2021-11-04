"use strict";

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Input'.
const Input = require("postcss/lib/input");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'TemplatePa... Remove this comment to see the full error message
const TemplateParser = require("./template-parser");

function templateParse(css, opts) {
  const input = new Input(css, opts);

  input.quasis = opts.quasis;
  input.templateLiteralStyles = opts.templateLiteralStyles;
  input.parseOptions = opts;
  const parser = new TemplateParser(input);

  parser.parse();

  return parser.root;
}

module.exports = templateParse;
