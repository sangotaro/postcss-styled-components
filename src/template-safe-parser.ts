"use strict";

import { templateTokenize } from "./template-tokenize";

const helper = require("./template-parser-helper");
const SafeParser = require("postcss-safe-parser/lib/safe-parser");

export class TemplateSafeParser extends SafeParser {
  createTokenizer() {
    this.tokenizer = templateTokenize(this.input, { ignoreErrors: true });
  }
  other(start) {
    return helper.literal.call(this, start) || super.other.call(this, start);
  }
  freeSemicolon(token) {
    return helper.freeSemicolon.call(this, token);
  }
}
