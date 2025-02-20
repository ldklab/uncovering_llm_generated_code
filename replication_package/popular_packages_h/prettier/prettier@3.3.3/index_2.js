"use strict";

// Utility to skip text
function skip(characters) {
  return (text, startIndex, options) => {
    const backwards = options?.backwards || false;
    if (startIndex === false) return false;
    let cursor = startIndex;
    const { length } = text;
    while (cursor >= 0 && cursor < length) {
      const character = text.charAt(cursor);
      if (characters instanceof RegExp ? !characters.test(character) : !characters.includes(character)) {
        return cursor;
      }
      backwards ? cursor-- : cursor++;
    }
    return cursor === -1 || cursor === length ? cursor : false;
  };
}

// Initialize skips for different text patterns
const skipWhitespace = skip(/\s/u);
const skipSpaces = skip(" \t");
const skipToLineEnd = skip(",; \t");
const skipEverythingButNewLine = skip(/[^\n\r]/u);

// Comments skipping utilities
function skipInlineComment(text, startIndex) {
  if (startIndex === false) return false;
  if (text.charAt(startIndex) === "/" && text.charAt(startIndex + 1) === "*") {
    for (let i = startIndex + 2; i < text.length; i++) {
      if (text.charAt(i) === "*" && text.charAt(i + 1) === "/") return i + 2;
    }
  }
  return startIndex;
}

function skipTrailingComment(text, startIndex) {
  if (startIndex === false) return false;
  if (text.charAt(startIndex) === "/" && text.charAt(startIndex + 1) === "/") {
    return skipEverythingButNewLine(text, startIndex);
  }
  return startIndex;
}

// Initialize skipping functions
const skip_inline_comment_default = skipInlineComment;
const skip_trailing_comment_default = skipTrailingComment;

// Utility to determine newline properties
function skipNewline(text, startIndex, options = {}) {
  const backwards = options?.backwards || false;
  if (startIndex === false) return false;
  const character = text.charAt(startIndex);
  
  if (backwards) {
    if (text.charAt(startIndex - 1) === "\r" && character === "\n") return startIndex - 2;
    if (["\n", "\r", "\u2028", "\u2029"].includes(character)) return startIndex - 1;
  } else {
    if (character === "\r" && text.charAt(startIndex + 1) === "\n") return startIndex + 2;
    if (["\n", "\r", "\u2028", "\u2029"].includes(character)) return startIndex + 1;
  }
  return startIndex;
}

const skip_newline_default = skipNewline;

// Functions to interact with lines
function isNextLineEmpty(text, startIndex) {
  let idx = startIndex, oldIdx = null;
  while (idx !== oldIdx) {
    oldIdx = idx;
    idx = skipToLineEnd(text, idx);
    idx = skip_inline_comment_default(text, idx);
    idx = skipSpaces(text, idx);
  }
  idx = skip_trailing_comment_default(text, idx);
  idx = skip_newline_default(text, idx);
  return idx !== false && has_newline_default(text, idx);
}

function isPreviousLineEmpty(text, startIndex) {
  let idx = startIndex - 1;
  idx = skipSpaces(text, idx, { backwards: true });
  idx = skip_newline_default(text, idx, { backwards: true });
  idx = skipSpaces(text, idx, { backwards: true });
  const idx2 = skip_newline_default(text, idx, { backwards: true });
  return idx !== idx2;
}

// Export as utilities
module.exports = {
  skipWhitespace,
  skipSpaces,
  skipToLineEnd,
  skipEverythingButNewLine,
  skipInlineComment: skip_inline_comment_default,
  skipNewline: skip_newline_default,
  skipTrailingComment: skip_trailing_comment_default,
  isNextLineEmpty,
  isPreviousLineEmpty
};
