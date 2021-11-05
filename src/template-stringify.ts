"use strict";

import { TemplateStringifier } from "./template-stringifier";

module.exports = function TemplateStringify(node, builder) {
  // @ts-expect-error TS2554: Expected 0 arguments, but got 1.
  const str = new TemplateStringifier(builder);

  str.stringify(node);
};
