"use strict";

import { getSyntax } from "./get-syntax";

const cache = {};

export function loadSyntax(opts, id) {
  const cssSyntax = getSyntax("css", opts);
  const modulePath = `${id}/template-${
    cssSyntax.parse.name === "safeParse" ? "safe-" : ""
  }parse`;
  let syntax = cache[modulePath];

  if (!syntax) {
    syntax = {
      parse: require(modulePath),
    };

    try {
      syntax.stringify = require(`${id}/template-stringify`);
    } catch (ex) {
      syntax.stringify = cssSyntax.stringify;
    }

    cache[modulePath] = syntax;
  }

  return syntax;
}
