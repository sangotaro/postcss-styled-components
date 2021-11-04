"use strict";

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'TemplateSt... Remove this comment to see the full error message
const TemplateStringifier = require("./template-stringifier");

module.exports = function TemplateStringify(node, builder) {
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
  const str = new TemplateStringifier(builder);

  str.stringify(node);
};
