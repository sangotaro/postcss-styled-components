"use strict";

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getTemplat... Remove this comment to see the full error message
function getTemplate(node, source) {
  return source.slice(
    node.quasis[0].start,
    node.quasis[node.quasis.length - 1].end
  );
}

module.exports = getTemplate;
