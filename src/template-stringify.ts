"use strict";

import { TemplateStringifier } from "./template-stringifier";

export function templateStringify(node, builder) {
  // @ts-expect-error TS2554: Expected 0 arguments, but got 1.
  const str = new TemplateStringifier(builder);

  // @ts-expect-error TS2339: Property 'stringify' does not exist on type 'TemplateStringifier'.
  str.stringify(node);
}
