"use strict";

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'parse'.
const parse = require("./parse");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'stringify'... Remove this comment to see the full error message
const stringify = require("./stringify");

const defaultConfig = {
  postcss: "css",
  stylus: "css",
  babel: "jsx",
  xml: "html",
};

// eslint-disable-next-line no-shadow
function initSyntax(syntax) {
  syntax.stringify = stringify.bind(syntax);
  syntax.parse = parse.bind(syntax);

  return syntax;
}

function syntax(config) {
  return initSyntax({
    config: { ...defaultConfig, ...config },
  });
}

initSyntax(syntax);
syntax.config = defaultConfig;
module.exports = syntax;
