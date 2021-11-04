"use strict";

const Container = require("postcss/lib/container");

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
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Literal'.
class Literal extends Container {
  constructor(defaults) {
    super(defaults);
    this.type = "literal";
  }
}

module.exports = Literal;
