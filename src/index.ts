"use strict";

import { extract } from "./extract";
import { initSyntax } from "./postcss-syntax/syntax";

const syntax = initSyntax(extract, "jsx");

module.exports = syntax;
