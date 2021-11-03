"use strict";

const path = require("path");
const patched = {};

function isPromise(obj) {
  return typeof obj === "object" && typeof obj.then === "function";
}

function runDocument(plugin) {
  const result = this.result;

  result.lastPlugin = plugin;
  const promise = result.root.nodes.map((root) => {
    try {
      return plugin(root, result);
    } catch (error) {
      this.handleError(error, plugin);
      throw error;
    }
  });

  if (promise.some(isPromise)) {
    return Promise.all(promise);
  }
}

function patchDocument(Document, LazyResult) {
  LazyResult = LazyResult.prototype;
  const runRoot = LazyResult.run;

  LazyResult.run = function run() {
    return (this.result.root instanceof Document ? runDocument : runRoot).apply(
      this,
      // eslint-disable-next-line prefer-rest-params
      arguments
    );
  };
}

function patchNode(Node) {
  Node = Node.prototype;
  const NodeToString = Node.toString;

  Node.toString = function toString(stringifier) {
    return NodeToString.call(this, stringifier || this.root().source.syntax);
  };
}

function patch(Document) {
  let fn;
  let file;

  if (Document) {
    patch();
    fn = patchDocument.bind(this, Document);
    file = "lazy-result";
  } else {
    fn = patchNode;
    file = "node";
  }

  findPostcss()
    .map((dir) => [`${dir}lib`, file].join(path.sep))
    .filter((f) => !patched[f])
    .forEach((f) => {
      try {
        fn(require(f));
      } catch (ex) {
        //
      }

      patched[f] = true;
    });
}

function findPostcss() {
  const result = {};

  for (const file in require.cache) {
    // eslint-disable-next-line regexp/no-unused-capturing-group
    if (/^(.+?(\\|\/))postcss(\2)/.test(file)) {
      // eslint-disable-next-line regexp/no-legacy-features
      result[RegExp.lastMatch] = true;
    }
  }

  return Object.keys(result);
}

module.exports = patch;
