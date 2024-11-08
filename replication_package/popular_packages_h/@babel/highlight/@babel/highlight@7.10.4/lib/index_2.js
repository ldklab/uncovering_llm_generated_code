"use strict";

import jsTokens, { matchToToken } from "js-tokens";
import { isKeyword, isReservedWord } from "@babel/helper-validator-identifier";
import chalk from "chalk";

export function shouldHighlight(options) {
  return chalk.supportsColor || options.forceColor;
}

export function getChalk(options) {
  let ch = chalk;
  if (options.forceColor) {
    ch = new chalk.constructor({ enabled: true, level: 1 });
  }
  return ch;
}

export default function highlight(code, options = {}) {
  if (shouldHighlight(options)) {
    const ch = getChalk(options);
    const defs = getDefs(ch);
    return highlightTokens(defs, code);
  } else {
    return code;
  }
}

function getDefs(ch) {
  return {
    keyword: ch.cyan,
    capitalized: ch.yellow,
    jsx_tag: ch.yellow,
    punctuator: ch.yellow,
    number: ch.magenta,
    string: ch.green,
    regex: ch.magenta,
    comment: ch.grey,
    invalid: ch.white.bgRed.bold,
  };
}

const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;
const JSX_TAG = /^[a-z][\w-]*$/i;
const BRACKET = /^[()[\]{}]$/;

function getTokenType(match) {
  const [offset, text] = match.slice(-2);
  const token = matchToToken(match);

  if (token.type === "name") {
    if (isKeyword(token.value) || isReservedWord(token.value)) {
      return "keyword";
    }
    if (JSX_TAG.test(token.value) && (text[offset - 1] === "<" || text.substr(offset - 2, 2) == "</")) {
      return "jsx_tag";
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
  return text.replace(jsTokens, function (...args) {
    const type = getTokenType(args);
    const colorize = defs[type];

    if (colorize) {
      return args[0].split(NEWLINE).map(str => colorize(str)).join("\n");
    } else {
      return args[0];
    }
  });
}
