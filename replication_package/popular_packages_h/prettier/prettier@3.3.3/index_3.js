"use strict";

// Utility functions for string manipulation and text processing
function skip(characters) {
  return (text, startIndex, options) => {
    const backwards = Boolean(options?.backwards);
    if (startIndex === false) return false;

    const { length } = text;
    let cursor = startIndex;
    while (cursor >= 0 && cursor < length) {
      const character = text.charAt(cursor);
      if (characters instanceof RegExp) {
        if (!characters.test(character)) return cursor;
      } else if (!characters.includes(character)) return cursor;

      backwards ? cursor-- : cursor++;
    }
    return cursor === -1 || cursor === length ? cursor : false;
  };
}

function skipInlineComment(text, startIndex) {
  if (!startIndex || text.charAt(startIndex) !== "/" || text.charAt(startIndex + 1) !== "*") {
    return startIndex;
  }
  for (let i = startIndex + 2; i < text.length; ++i) {
    if (text.charAt(i) === "*" && text.charAt(i + 1) === "/") {
      return i + 2;
    }
  }
  return startIndex;
}

function skipNewline(text, startIndex, options) {
  const backwards = Boolean(options?.backwards);
  if (startIndex === false) return false;

  const character = text.charAt(startIndex);
  if (backwards) {
    if (text.charAt(startIndex - 1) === "\r" && character === "\n") return startIndex - 2;
    if (character === "\n" || character === "\r" || character === "\u2028" || character === "\u2029") return startIndex - 1;
  } else {
    if (character === "\r" && text.charAt(startIndex + 1) === "\n") return startIndex + 2;
    if (character === "\n" || character === "\r" || character === "\u2028" || character === "\u2029") return startIndex + 1;
  }
  return startIndex;
}

function getNextNonSpaceNonCommentCharacterIndex(text, startIndex) {
  let oldIdx = null;
  let nextIdx = startIndex;
  while (nextIdx !== oldIdx) {
    oldIdx = nextIdx;
    nextIdx = skip(" \\t")(text, nextIdx);
    nextIdx = skipInlineComment(text, nextIdx);
    nextIdx = skip("//")(text, nextIdx);
    nextIdx = skipNewline(text, nextIdx);
  }
  return nextIdx;
}

// Main exports and asynchronous-based loading of core functions
const prettierPromise = import('./index.mjs');
const functionNames = ['formatWithCursor', 'format', 'check', 'resolveConfig', 'resolveConfigFile', 'clearConfigCache', 'getFileInfo', 'getSupportInfo'];

const prettier = {};
for (const name of functionNames) {
  prettier[name] = async (...args) => (await prettierPromise)[name](...args);
}

const debugApiFunctionNames = ['parse', 'formatAST', 'formatDoc', 'printToDoc', 'printDocToString'];
prettier.__debug = {};
for (const name of debugApiFunctionNames) {
  prettier.__debug[name] = async (...args) => (await prettierPromise).__debug[name](...args);
}

// Utility module exports
prettier.util = { skip, skipInlineComment, skipNewline, getNextNonSpaceNonCommentCharacterIndex };

// Export module with versioning
prettier.version = require('./version.evaluate');
module.exports = prettier;
