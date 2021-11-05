"use strict";

import Container from "postcss/lib/container";

/**
 * Represents a JS literal
 *
 * @extends Container
 *
 * @example
 * const root = postcss.parse('{}');
 * const literal = root.first;
 * literal.type       //=> 'literal'
 * literal.toString() //=> 'a{}'
 */
export class Literal extends Container {
  constructor(defaults) {
    super(defaults);
    this.type = "literal";
  }
}
