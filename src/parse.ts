import type { Parser } from "postcss";

import { Document } from "./document";
import { parseStyle } from "./parse-style";

export const parse: Parser<Document> = function (source, opts) {
  const document = parseStyle(source.toString(), opts ?? {});

  document.source.lang = "jsx";

  return document;
};
