"use strict";

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getLang'.
const getLang = require("./get-lang");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'normalOpts... Remove this comment to see the full error message
const normalOpts = require("./normal-opts");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'parser'.
const parser = require("./parser");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'processor'... Remove this comment to see the full error message
const processor = require("./processor");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getSyntax'... Remove this comment to see the full error message
function getSyntax(opts, source) {
  const rules = opts.syntax && opts.syntax.config && opts.syntax.config.rules;
  const file = opts.from || "";

  return (
    (rules &&
      // eslint-disable-next-line no-confusing-arrow
      rules.find((rule) =>
        rule.test.test ? rule.test.test(file) : rule.test(file, source)
      )) ||
    getLang(file, source) || {
      lang: "css",
    }
  );
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'parse'.
function parse(source, opts) {
  source = source.toString();
  opts = normalOpts(opts, this);
  const syntax = getSyntax(opts, source);
  const syntaxOpts = { ...opts, ...syntax.opts };
  let root;

  if (syntax.extract) {
    root = processor(source, syntax.extract, syntaxOpts);
    root.source.lang = syntax.extract;
  } else {
    root = parser(source, syntax.lang, syntaxOpts);
    root.source.lang = syntax.lang;
  }

  return root;
}

module.exports = parse;
