"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = highlight;
exports.shouldHighlight = shouldHighlight;

const jsTokens = require("js-tokens");
const { isKeyword, isStrictReservedWord } = require("@babel/helper-validator-identifier");
const picocolors = require("picocolors");

function getColors(forceColor) {
  if (forceColor) {
    return picocolors.createColors(true);
  }
  return typeof process === "object" && (process.env.FORCE_COLOR === "0" || process.env.FORCE_COLOR === "false") 
         ? picocolors.createColors(false) 
         : picocolors;
}

const sometimesKeywords = new Set(["as", "async", "from", "get", "of", "set"]);
const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;
const BRACKET = /^[()[\]{}]$/;

function getDefs(colors) {
  return {
    keyword: colors.cyan,
    capitalized: colors.yellow,
    jsxIdentifier: colors.yellow,
    punctuator: colors.yellow,
    number: colors.magenta,
    string: colors.green,
    regex: colors.magenta,
    comment: colors.gray,
    invalid: colors.bold(colors.bgRed(colors.white))
  };
}

function* tokenize(text) {
  let match;
  while (match = jsTokens.exec(text)) {
    const token = jsTokens.matchToToken(match);
    yield {
      type: getTokenType(token, match.index, text),
      value: token.value
    };
  }
}

function getTokenType(token, offset, text) {
  if (token.type === "name") {
    if (isKeyword(token.value) || isStrictReservedWord(token.value, true) || sometimesKeywords.has(token.value)) {
      return "keyword";
    }
    if (/^[a-z][\w-]*$/i.test(token.value) && (text[offset - 1] === "<" || text.slice(offset - 2, offset) === "</")) {
      return "jsxIdentifier";
    }
    if (token.value[0] !== token.value[0].toLowerCase()) {
      return "capitalized";
    }
  }
  if (token.type === "punctuator" && BRACKET.test(token.value)) {
    return "bracket";
  }
  if (token.type === "invalid" && (token.value === "@" || token.value === "#")) {
    return "punctuator";
  }
  return token.type;
}

function highlightTokens(defs, text) {
  return Array.from(tokenize(text)).map(({ type, value }) => 
    defs[type] ? value.split(NEWLINE).map(str => defs[type](str)).join("\n") : value
  ).join('');
}

function shouldHighlight(options) {
  return getColors().isColorSupported || options.forceColor;
}

function highlight(code, options = {}) {
  if (code !== "" && shouldHighlight(options)) {
    const defs = getDefs(getColors(options.forceColor));
    return highlightTokens(defs, code);
  } else {
    return code;
  }
}
