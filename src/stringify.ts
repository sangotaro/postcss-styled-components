import type { Stringifier, Builder } from "postcss";

import { Document } from "./document";

function docStringify(document: Document, builder: Builder) {
  document.nodes.forEach((root) => {
    // @ts-expect-error TS2339: Property 'beforeStart' does not exist on type 'AtRuleRaws | RuleRaws | DeclarationRaws | CommentRaws'.
    //Property 'beforeStart' does not exist on type 'AtRuleRaws'.
    // TS2345: Argument of type '"beforeStart"' is not assignable to parameter of type '"start" | "end"'.
    builder(root.raws.beforeStart, root, "beforeStart");
    root.source.syntax && root.source.syntax.stringify(root, builder);
  });
  // @ts-expect-error TS2345: Argument of type '"afterEnd"' is not assignable to parameter of type '"start" | "end"'.
  builder(document.raws.afterEnd, document, "afterEnd");
}

export const stringify: Stringifier = (node, builder) => {
  if (node instanceof Document) {
    return docStringify(node, builder);
  }

  return node.source.syntax.stringify(node, builder);
};
