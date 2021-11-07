"use strict";

import { extract } from "./extract";
import { parseStyle } from "./postcss-syntax/parse-style";
import { stringify } from "./postcss-syntax/stringify";

function parse(source, opts) {
  source = source.toString();
  const document = parseStyle(source, opts || {}, extract(source, opts));

  document.source.lang = "jsx";

  return document;
}

module.exports = {
  parse,
  stringify,
};
