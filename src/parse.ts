"use strict";

import { extract } from "./extract";
import { parseStyle } from "./parse-style";

export function parse(source, opts) {
  source = source.toString();
  const document = parseStyle(source, opts || {}, extract(source, opts));

  // @ts-expect-error TS2339: Property 'lang' does not exist on type 'Source'.
  document.source.lang = "jsx";

  return document;
}
