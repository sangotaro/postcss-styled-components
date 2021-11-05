"use strict";

export function normalOpts(opts, syntax) {
  if (!opts) {
    opts = {};
  }

  opts.syntax = syntax;

  return opts;
}
