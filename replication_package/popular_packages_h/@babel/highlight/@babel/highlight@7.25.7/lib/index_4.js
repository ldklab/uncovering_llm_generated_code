"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = highlight;
exports.shouldHighlight = shouldHighlight;

var _jsTokens = require("js-tokens");
var _helperValidatorIdentifier = require("@babel/helper-validator-identifier");
var _picocolors = _interopRequireWildcard(require("picocolors"));

function _interopRequireWildcard(obj) { 
  if (obj && obj.__esModule) return obj; 
  const newObj = {}; 
  if (obj != null) {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  return newObj; 
}

const colors = process.env.FORCE_COLOR === "0" || process.env.FORCE_COLOR === "false" 
  ? (0, _picocolors.createColors)(false) 
  : _picocolors.default;

const sometimesKeywords = new Set(["as", "async", "from", "get", "of", "set"]);

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
    invalid: colors.white.bgRed.bold
  };
}

const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;
const BRACKET = /^[()[\]{}]$/;

function* tokenize(text) {
  let match;
  while (match = _jsTokens.default.exec(text)) {
    const token = _jsTokens.matchToToken(match);
    yield {
      type: getTokenType(token, match.index, text),
      value: token.value
    };
  }
}

function getTokenType(token, offset, text) {
  if (token.type === "name") {
    if ((0, _helperValidatorIdentifier.isKeyword)(token.value) || 
        (0, _helperValidatorIdentifier.isStrictReservedWord)(token.value, true) || 
        sometimesKeywords.has(token.value)) {
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
  return colors.isColorSupported || options.forceColor;
}

let pcWithForcedColor;

function getColors(forceColor) {
  if (forceColor) {
    pcWithForcedColor = pcWithForcedColor || (0, _picocolors.createColors)(true);
    return pcWithForcedColor;
  }
  return colors;
}

function highlight(code, options = {}) {
  if (code !== "" && shouldHighlight(options)) {
    const defs = getDefs(getColors(options.forceColor));
    return highlightTokens(defs, code);
  }
  return code;
}

exports.getChalk = ({ forceColor }) => {
  let chalk = require("chalk");
  if (forceColor) {
    return new chalk.constructor({ enabled: true, level: 1 });
  }
  return chalk;
};
