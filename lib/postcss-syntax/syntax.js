"use strict";

const normalOpts = require("./normal-opts");
const parseStyle = require("./parse-style");
const stringify = require("./stringify");

module.exports = (extract, lang) => {
  const defaultConfig = {
    postcss: "css",
    stylus: "css",
    babel: "jsx",
    xml: "html",
  };

  function parse(source, opts) {
    source = source.toString();
    opts = normalOpts(opts, this);
    const document = parseStyle(source, opts, extract(source, opts));

    document.source.lang = lang;

    return document;
  }

  // eslint-disable-next-line no-shadow
  function initSyntax(syntax) {
    syntax.stringify = stringify.bind(syntax);
    syntax.parse = parse.bind(syntax);
    syntax.extract = extract.bind(syntax);

    return syntax;
  }

  function syntax(config) {
    return initSyntax({
      config: { ...defaultConfig, ...config },
    });
  }

  initSyntax(syntax);
  syntax.config = defaultConfig;

  return syntax;
};
