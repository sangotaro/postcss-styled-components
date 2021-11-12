import type { Parser } from "postcss";

import { parseStyle } from "./parse-style";

export const parse: Parser = function (source, opts) {
  const document = parseStyle(source.toString(), opts ?? {});

  document.source.lang = "jsx";

  return document;
};
