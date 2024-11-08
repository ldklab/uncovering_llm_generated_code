/*!
 * is-glob <https://github.com/jonschlinkert/is-glob>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

const isExtglob = require('is-extglob');

const MATCHING_PAIRS = { '{': '}', '(': ')', '[': ']' };

function strictGlobCheck(input) {
  if (input.startsWith('!')) {
    return true;
  }

  let index = 0;
  let indicators = {
    pipe: -2,
    closeSquare: -2,
    closeCurly: -2,
    closeParen: -2,
    backSlash: -2
  };

  while (index < input.length) {
    const currentChar = input[index];

    if (currentChar === '*') {
      return true;
    }

    if (input[index + 1] === '?' && /[\].+)]/.test(currentChar)) {
      return true;
    }

    if (handleSquareBrackets(input, index, indicators)) {
      return true;
    }

    if (/[\{\(\|]/.test(currentChar) && testMatchingClosure(input, index, indicators, currentChar)) {
      return true;
    }

    index = handleEscapeCharacter(input, index) || index + 1;
  }
  
  return false;
}

function relaxedGlobCheck(input) {
  if (input.startsWith('!')) {
    return true;
  }

  let index = 0;

  while (index < input.length) {
    if (/[*?{}()[\]]/.test(input[index])) {
      return true;
    }

    index = handleEscapeCharacter(input, index) || index + 1;
  }
  
  return false;
}

function handleSquareBrackets(input, index, indicators) {
  if (indicators.closeSquare !== -1 && input[index] === '[' && input[index + 1] !== ']') {
    if (indicators.closeSquare < index) {
      indicators.closeSquare = input.indexOf(']', index);
    }
    if (indicators.closeSquare > index && ensureBackslashNotInterrupting(input, index, indicators.closeSquare)) {
      return true;
    }
  }
}

function ensureBackslashNotInterrupting(input, start, end) {
  const backSlashIndex = input.indexOf('\\', start);
  return backSlashIndex === -1 || backSlashIndex > end;
}

function testMatchingClosure(input, index, indicators, currentChar) {
  const closingChar = MATCHING_PAIRS[currentChar];
  if (/[\{\|]/.test(currentChar) && input[index + 1] !== closingChar) {
    const closureIndex = input.indexOf(closingChar, index);
    return closureIndex > index && ensureBackslashNotInterrupting(input, index, closureIndex);
  }
  return false;
}

function handleEscapeCharacter(input, index) {
  if (input[index] === '\\') {
    const openingChar = input[index + 1];
    const closingChar = MATCHING_PAIRS[openingChar];
    if (closingChar) {
      const closingIndex = input.indexOf(closingChar, index + 2);
      if (closingIndex !== -1) {
        return closingIndex + 1;
      }
    }
  }
  return null;
}

module.exports = function isGlob(input, options) {
  if (typeof input !== 'string' || input.length === 0) {
    return false;
  }

  if (isExtglob(input)) {
    return true;
  }

  const checkFunction = options && options.strict === false ? relaxedGlobCheck : strictGlobCheck;

  return checkFunction(input);
};
