"use strict";

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'normalOpts... Remove this comment to see the full error message
function normalOpts(opts, syntax) {
  if (!opts) {
    opts = {};
  }

  opts.syntax = syntax;

  return opts;
}

module.exports = normalOpts;
