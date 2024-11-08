"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shouldHighlight = shouldHighlight;
exports.getChalk = getChalk;
exports.default = highlight;

const jsTokens = require("js-tokens");
const helperValidatorIdentifier = require("@babel/helper-validator-identifier");
const chalk = require("chalk");

function getDefs(chalkInstance) {
  return {
    keyword: chalkInstance.cyan,
    capitalized: chalkInstance.yellow,
    jsx_tag: chalkInstance.yellow,
    punctuator: chalkInstance.yellow,
    number: chalkInstance.magenta,
    string: chalkInstance.green,
    regex: chalkInstance.magenta,
    comment: chalkInstance.grey,
    invalid: chalkInstance.white.bgRed.bold
  };
}

const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;
const JSX_TAG = /^[a-z][\w-]*$/i;
const BRACKET = /^[()[\]{}]$/;

function getTokenType(match) {
  const [offset, text] = match.slice(-2);
  const token = jsTokens.matchToToken(match);

  switch (token.type) {
    case "name":
      if (helperValidatorIdentifier.isKeyword(token.value) || helperValidatorIdentifier.isReservedWord(token.value)) {
        return "keyword";
      }
      if (JSX_TAG.test(token.value) && (text[offset - 1] === "<" || text.substr(offset - 2, 2) == "</")) {
        return "jsx_tag";
      }
      if (token.value[0] !== token.value[0].toLowerCase()) {
        return "capitalized";
      }
      break;
    case "punctuator":
      if (BRACKET.test(token.value)) return "bracket";
      if (token.value === "@" || token.value === "#") return "punctuator";
      break;
    default:
      return token.type;
  }
}

function highlightTokens(defs, text) {
  return text.replace(jsTokens.default, function (...args) {
    const type = getTokenType(args);
    const colorize = defs[type];
    return colorize ? args[0].split(NEWLINE).map(str => colorize(str)).join("\n") : args[0];
  });
}

function shouldHighlight(options) {
  return chalk.supportsColor || options.forceColor;
}

function getChalk(options) {
  return options.forceColor ? 
    new chalk.constructor({ enabled: true, level: 1 }) : 
    chalk;
}

function highlight(code, options = {}) {
  return shouldHighlight(options) ? 
    highlightTokens(getDefs(getChalk(options)), code) : 
    code;
}
