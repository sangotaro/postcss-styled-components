import PostCssRoot from "postcss/lib/root";

import { stringify } from "./stringify";

export class Document extends PostCssRoot {
  toString(stringifier) {
    return super.toString(
      stringifier || {
        stringify,
      }
    );
  }

  each(callback) {
    // @ts-expect-error TS2339: Property 'each' does not exist on type 'ChildNode'.
    const result = this.nodes.map((node) => node.each(callback));

    // eslint-disable-next-line no-shadow
    return result.every((result) => result !== false) && result.pop();
  }

  append() {
    // @ts-expect-error TS2339: Property 'append' does not exist on type 'ChildNode'.
    // eslint-disable-next-line prefer-spread, prefer-rest-params
    this.last.append.apply(this.last, Array.from(arguments));

    return this;
  }

  prepend() {
    // @ts-expect-error TS2339: Property 'prepend' does not exist on type 'ChildNode'.
    // eslint-disable-next-line prefer-spread, prefer-rest-params
    this.first.prepend.apply(this.first, Array.from(arguments));

    return this;
  }

  insertBefore(exist, add) {
    exist.prepend(add);

    return this;
  }

  insertAfter(exist, add) {
    exist.append(add);

    return this;
  }
}
