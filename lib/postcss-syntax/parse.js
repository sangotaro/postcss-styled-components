"use strict";

const getLang = require("./get-lang");
const normalOpts = require("./normal-opts");
const parser = require("./parser");
const processor = require("./processor");

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
