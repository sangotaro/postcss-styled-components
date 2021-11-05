"use strict";

import { freeSemicolon, literal } from "./template-parser-helper";
import { templateTokenize } from "./template-tokenize";

// no dts
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SafeParser = require("postcss-safe-parser/lib/safe-parser");

export class TemplateSafeParser extends SafeParser {
  createTokenizer() {
    this.tokenizer = templateTokenize(this.input, { ignoreErrors: true });
  }
  other(start) {
    return literal.call(this, start) || super.other.call(this, start);
  }
  freeSemicolon(token) {
    return freeSemicolon.call(this, token);
  }
}
