"use strict";

import jsTokens, { matchToToken } from "js-tokens";
import { isKeyword, isStrictReservedWord } from "@babel/helper-validator-identifier";
import picocolors from "picocolors";

const colors = determineColors();
const sometimesKeywords = new Set(["as", "async", "from", "get", "of", "set"]);
const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;
const BRACKET = /^[()[\]{}]$/;

function determineColors() {
  return typeof process === "object" && (process.env.FORCE_COLOR === "0" || process.env.FORCE_COLOR === "false") 
    ? picocolors.createColors(false) 
    : picocolors;
}

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
  for (const match of text.matchAll(jsTokens)) {
    const token = matchToToken(match);
    yield {
      type: determineTokenType(token, match.index, text),
      value: token.value
    };
  }
}

function determineTokenType(token, offset, text) {
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
  } else if (token.type === "punctuator" && BRACKET.test(token.value)) {
    return "bracket";
  } else if (token.type === "invalid" && (token.value === "@" || token.value === "#")) {
    return "punctuator";
  }
  return token.type;
}

function highlightTokens(defs, text) {
  let highlighted = "";
  for (const { type, value } of tokenize(text)) {
    const colorize = defs[type];
    highlighted += colorize ? value.split(NEWLINE).map(colorize).join("\n") : value;
  }
  return highlighted;
}

export function shouldHighlight(options) {
  return colors.isColorSupported || options.forceColor;
}

let cachedColors = undefined;
function getColors(forceColor) {
  if (forceColor) {
    if (!cachedColors) cachedColors = picocolors.createColors(true);
    return cachedColors;
  }
  return colors;
}

export default function highlight(code, options = {}) {
  if (code && shouldHighlight(options)) {
    const defs = getDefs(getColors(options.forceColor));
    return highlightTokens(defs, code);
  }
  return code;
}

let chalk, forcedChalk;
export const getChalk = ({ forceColor }) => {
  if (!chalk) chalk = require("chalk");
  if (forceColor) {
    if (!forcedChalk) forcedChalk = new chalk.constructor({ enabled: true, level: 1 });
    return forcedChalk;
  }
  return chalk;
};
