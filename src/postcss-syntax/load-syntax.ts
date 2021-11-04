"use strict";

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getSyntax'... Remove this comment to see the full error message
const getSyntax = require("./get-syntax");
const cache = {};

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'loadSyntax... Remove this comment to see the full error message
function loadSyntax(opts, id) {
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

module.exports = loadSyntax;
