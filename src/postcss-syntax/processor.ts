"use strict";

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'parseStyle... Remove this comment to see the full error message
const parseStyle = require("./parse-style");

// @ts-expect-error TS2393: Duplicate function implementation.
function getSyntax(config, syntax) {
  if (typeof syntax !== "string") {
    return syntax;
  }

  let syntaxConfig = config[syntax];

  if (syntaxConfig) {
    syntaxConfig = getSyntax(config, syntaxConfig);
  } else {
    syntaxConfig = {
      extract: require(`${syntax
        .toLowerCase()
        .replace(/^(postcss-)?/i, "postcss-")}/extract`),
    };
    config[syntax] = syntaxConfig;
  }

  return syntaxConfig;
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'processor'... Remove this comment to see the full error message
function processor(source, lang, opts) {
  const syntax = getSyntax(opts.syntax.config, lang);
  const styles = (syntax.extract || syntax)(source, opts) || [];

  return parseStyle(source, opts, styles);
}

module.exports = processor;
