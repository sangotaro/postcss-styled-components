"use strict";

function stringify(document) {
  // eslint-disable-next-line no-shadow
  let stringify;

  if (document instanceof require("./document")) {
    stringify = docStringify;
  } else {
    stringify = document.source.syntax.stringify;
  }

  // eslint-disable-next-line prefer-rest-params
  return stringify.apply(this, arguments);
}

function docStringify(document, builder) {
  document.nodes.forEach((root) => {
    builder(root.raws.beforeStart, root, "beforeStart");
    root.source.syntax && root.source.syntax.stringify(root, builder);
  });
  builder(document.raws.afterEnd, document, "afterEnd");
}

module.exports = stringify;
