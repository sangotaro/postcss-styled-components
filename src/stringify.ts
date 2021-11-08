import { Document } from "./document";

function docStringify(document, builder) {
  document.nodes.forEach((root) => {
    builder(root.raws.beforeStart, root, "beforeStart");
    root.source.syntax && root.source.syntax.stringify(root, builder);
  });
  builder(document.raws.afterEnd, document, "afterEnd");
}

export function stringify(node, builder) {
  if (node instanceof Document) {
    return docStringify(node, builder);
  }

  return node.source.syntax.stringify(node, builder);
}
