"use strict";

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getSyntax'... Remove this comment to see the full error message
const getSyntax = require("./get-syntax");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'patch'.
const patch = require("./patch-postcss");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'parser'.
function parser(source, lang, opts) {
  patch();

  const syntax = getSyntax(lang, opts);
  const root = syntax.parse(source, opts);

  root.source.syntax = syntax;
  root.source.lang = lang;

  return root;
}

module.exports = parser;
