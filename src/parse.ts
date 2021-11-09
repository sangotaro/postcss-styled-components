import type { Parser } from "postcss";

import { parseStyle } from "./parse-style";

export const parse: Parser = function (source, opts) {
  source = source.toString();
  const document = parseStyle(source.toString(), opts ?? {});

  // @ts-expect-error TS2339: Property 'lang' does not exist on type 'Source'.
  document.source.lang = "jsx";

  return document;
};
