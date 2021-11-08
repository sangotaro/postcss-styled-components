// no dts
import Stringifier from "postcss/lib/stringifier";

export class TemplateStringifier extends Stringifier {
  literal(node) {
    if (node.nodes && node.nodes.length) {
      node.nodes.forEach((root) => {
        // @ts-expect-error TS2339: Property 'builder' does not exist on type 'TemplateStringifier'.
        this.builder(root.raws.beforeStart, root, "beforeStart");
        // @ts-expect-error  TS2339: Property 'stringify' does not exist on type 'TemplateStringifier'.
        this.stringify(root);
        // @ts-expect-error TS2339: Property 'builder' does not exist on type 'TemplateStringifier'.
        this.builder(root.raws.afterEnd, root, "afterEnd");
      });
    } else {
      // @ts-expect-error  TS2339: Property 'builder' does not exist on type 'TemplateStringifier'.
      this.builder(node.text, node);
    }

    if (node.raws.ownSemicolon) {
      // @ts-expect-error  TS2339: Property 'builder' does not exist on type 'TemplateStringifier'.
      this.builder(node.raws.ownSemicolon, node, "end");
    }
  }
}
