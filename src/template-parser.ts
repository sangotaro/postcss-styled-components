"use strict";

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'helper'.
const helper = require("./template-parser-helper");
const Parser = require("postcss/lib/parser");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'templateTo... Remove this comment to see the full error message
const templateTokenize = require("./template-tokenize");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'TemplatePa... Remove this comment to see the full error message
class TemplateParser extends Parser {
  createTokenizer() {
    this.tokenizer = templateTokenize(this.input);
  }
  other(start) {
    return helper.literal.call(this, start) || super.other.call(this, start);
  }
  freeSemicolon(token) {
    return helper.freeSemicolon.call(this, token);
  }
}
module.exports = TemplateParser;
