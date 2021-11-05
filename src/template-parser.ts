"use strict";

import { templateTokenize } from "./template-tokenize";

const helper = require("./template-parser-helper");
const Parser = require("postcss/lib/parser");

export class TemplateParser extends Parser {
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
