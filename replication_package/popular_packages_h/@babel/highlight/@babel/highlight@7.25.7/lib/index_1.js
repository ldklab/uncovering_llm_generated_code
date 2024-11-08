"use strict";

import jsTokens, { matchToToken } from "js-tokens";
import { isKeyword, isStrictReservedWord } from "@babel/helper-validator-identifier";
import * as picocolors from "picocolors";

const { createColors, isColorSupported } = picocolors;
const sometimesKeywords = new Set(["as", "async", "from", "get", "of", "set"]);
const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;
const BRACKET = /^[()[\]{}]$/;
const JSX_TAG = /^[a-z][\w-]*$/i;

const colors = typeof process === "object" && (process.env.FORCE_COLOR === "0" || process.env.FORCE_COLOR === "false") ? createColors(false) : picocolors.default;

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
    invalid: compose(compose(colors.white, colors.bgRed), colors.bold)
  };
}

function compose(f, g) {
  return v => f(g(v));
}

function* tokenize(text) {
  let match;
  while ((match = jsTokens.exec(text))) {
    const token = matchToToken(match);
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
    if (JSX_TAG.test(token.value) && (text[offset - 1] === "<" || text.slice(offset - 2, offset) === "</")) {
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
  let highlighted = "";
  for (const { type, value } of tokenize(text)) {
    const colorize = defs[type];
    if (colorize) {
      highlighted += value.split(NEWLINE).map(str => colorize(str)).join("\n");
    } else {
      highlighted += value;
    }
  }
  return highlighted;
}

function shouldHighlight(options) {
  return isColorSupported || options.forceColor;
}

let pcWithForcedColor;

function getColors(forceColor) {
  if (forceColor) {
    if (!pcWithForcedColor) {
      pcWithForcedColor = createColors(true);
    }
    return pcWithForcedColor;
  }
  return colors;
}

export default function highlight(code, options = {}) {
  if (code !== "" && shouldHighlight(options)) {
    const defs = getDefs(getColors(options.forceColor));
    return highlightTokens(defs, code);
  } else {
    return code;
  }
}

let chalk, chalkWithForcedColor;

export function getChalk({ forceColor }) {
  if (!chalk) {
    chalk = require("chalk");
  }
  if (forceColor) {
    if (!chalkWithForcedColor) {
      chalkWithForcedColor = new chalk.constructor({ enabled: true, level: 1 });
    }
    return chalkWithForcedColor;
  }
  return chalk;
}
