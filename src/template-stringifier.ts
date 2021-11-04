"use strict";

const Stringifier = require("postcss/lib/stringifier");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'TemplateSt... Remove this comment to see the full error message
class TemplateStringifier extends Stringifier {
  literal(node) {
    if (node.nodes && node.nodes.length) {
      node.nodes.forEach((root) => {
        this.builder(root.raws.beforeStart, root, "beforeStart");
        this.stringify(root);
        this.builder(root.raws.afterEnd, root, "afterEnd");
      });
    } else {
      this.builder(node.text, node);
    }

    if (node.raws.ownSemicolon) {
      this.builder(node.raws.ownSemicolon, node, "end");
    }
  }
}

module.exports = TemplateStringifier;
