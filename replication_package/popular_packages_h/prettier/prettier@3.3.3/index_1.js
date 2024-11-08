"use strict";

// Utility Functions
const utilities = {
  createObject: Object.create,
  defineProperty: Object.defineProperty,
  getPropertyDescriptor: Object.getOwnPropertyDescriptor,
  getOwnPropertyNames: Object.getOwnPropertyNames,
  getPrototypeOf: Object.getPrototypeOf,
  hasOwnProperty: Object.prototype.hasOwnProperty,
  
  esm: (fn, res) => function init() {
    return fn && (res = (0, fn[utilities.getOwnPropertyNames(fn)[0]])(fn = 0)), res;
  },

  commonJS: (cb, mod) => function require() {
    return mod || (0, cb[utilities.getOwnPropertyNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  },

  export: (target, all) => {
    for (let name in all)
      utilities.defineProperty(target, name, { get: all[name], enumerable: true });
  }
};

// String Utilities
function skip(characters) {
  return (text, startIndex, options) => {
    const backwards = Boolean(options?.backwards);
    if (startIndex === false) return false;
    const length = text.length;
    let cursor = startIndex;
    while (cursor >= 0 && cursor < length) {
      const character = text.charAt(cursor);
      if (characters instanceof RegExp) {
        if (!characters.test(character)) return cursor;
      } else if (!characters.includes(character)) {
        return cursor;
      }
      backwards ? cursor-- : cursor++;
    }
    if (cursor === -1 || cursor === length) return cursor;
    return false;
  };
}

const skipSpaces = skip(" \t");

// Init Module
const init_skip = utilities.esm({
  "src/utils/skip.js"() {
    skipWhitespace = skip(/\s/u);
    skipToLineEnd = skip(",; \t");
    skipEverythingButNewLine = skip(/[^\n\r]/u);
  }
});

// Comment Handling Utilities
function skipInlineComment(text, startIndex) {
  if (startIndex === false) return false;
  if (text.charAt(startIndex) === "/" && text.charAt(startIndex + 1) === "*") {
    for (let i = startIndex + 2; i < text.length; ++i) {
      if (text.charAt(i) === "*" && text.charAt(i + 1) === "/") {
        return i + 2;
      }
    }
  }
  return startIndex;
}

const skip_inline_comment_default = skipInlineComment;

const init_skip_inline_comment = utilities.esm({
  "src/utils/skip-inline-comment.js"() {
    skip_inline_comment_default = skipInlineComment;
  }
});

// Exporting Module
const public_exports = {};
utilities.export(public_exports, {
  skip,
  skipSpaces,
});

// Prettier Integration
const prettierPromise = import("./index.mjs");
const functionNames = [
  "formatWithCursor",
  "format",
  "check",
  "resolveConfig",
  "resolveConfigFile",
  "clearConfigCache",
  "getFileInfo",
  "getSupportInfo"
];

const prettier = Object.create(null);
for (const name of functionNames) {
  prettier[name] = async (...args) => {
    const prettierInstance = await prettierPromise;
    return prettierInstance[name](...args);
  };
}

module.exports = prettier;
