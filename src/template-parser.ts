"use strict";

import { freeSemicolon, literal } from "./template-parser-helper";
import Parser from "postcss/lib/parser";
import { templateTokenize } from "./template-tokenize";

export class TemplateParser extends Parser {
  createTokenizer() {
    // @ts-expect-error TS2339: Property 'tokenizer' does not exist on type 'TemplateParser'.,  TS2339: Property 'input' does not exist on type 'TemplateParser'.
    this.tokenizer = templateTokenize(this.input);
  }
  other(start) {
    return literal.call(this, start) || super.other.call(this, start);
  }
  freeSemicolon(token) {
    return freeSemicolon.call(this, token);
  }
}
