node
/*!
 * is-glob <https://github.com/jonschlinkert/is-glob>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

const isExtglob = require('is-extglob');

// Character pairs for possible glob syntax
const chars = { '{': '}', '(': ')', '[': ']' };

// Function to check for strict glob patterns
const strictCheck = str => {
  if (str[0] === '!') return true;

  let index = 0, pipeIndex = -2, closeSquareIndex = -2;
  let closeCurlyIndex = -2, closeParenIndex = -2, backSlashIndex = -2;

  while (index < str.length) {
    if (str[index] === '*' || (str[index + 1] === '?' && /[\].+)]/.test(str[index]))) return true;

    if (closeSquareIndex !== -1 && str[index] === '[' && str[index + 1] !== ']') {
      if (closeSquareIndex < index) closeSquareIndex = str.indexOf(']', index);
      if (closeSquareIndex > index && (backSlashIndex === -1 || backSlashIndex > closeSquareIndex)) return true;
      backSlashIndex = str.indexOf('\\', index);
      if (backSlashIndex === -1 || backSlashIndex > closeSquareIndex) return true;
    }

    if (closeCurlyIndex !== -1 && str[index] === '{' && str[index + 1] !== '}') {
      closeCurlyIndex = str.indexOf('}', index);
      if (closeCurlyIndex > index && (backSlashIndex === -1 || backSlashIndex > closeCurlyIndex)) return true;
    }

    if (closeParenIndex !== -1 && str[index] === '(' && str[index + 1] === '?' && /[:!=]/.test(str[index + 2]) && str[index + 3] !== ')') {
      closeParenIndex = str.indexOf(')', index);
      if (closeParenIndex > index && (backSlashIndex === -1 || backSlashIndex > closeParenIndex)) return true;
    }

    if (pipeIndex !== -1 && str[index] === '(' && str[index + 1] !== '|') {
      if (pipeIndex < index) pipeIndex = str.indexOf('|', index);
      if (pipeIndex !== -1 && str[pipeIndex + 1] !== ')') {
        closeParenIndex = str.indexOf(')', pipeIndex);
        if (closeParenIndex > pipeIndex && (backSlashIndex === -1 || backSlashIndex > closeParenIndex)) return true;
      }
    }

    if (str[index] === '\\') {
      const open = str[index + 1];
      index += 2;
      const close = chars[open];

      if (close) {
        const n = str.indexOf(close, index);
        if (n !== -1) index = n + 1;
      }

      if (str[index] === '!') return true;
    } else {
      index++;
    }
  }
  return false;
};

// Function to check for relaxed glob patterns
const relaxedCheck = str => {
  if (str[0] === '!') return true;

  let index = 0;
  while (index < str.length) {
    if (/[*?{}()[\]]/.test(str[index])) return true;

    if (str[index] === '\\') {
      const open = str[index + 1];
      index += 2;
      const close = chars[open];
      
      if (close) {
        const n = str.indexOf(close, index);
        if (n !== -1) index = n + 1;
      }

      if (str[index] === '!') return true;
    } else {
      index++;
    }
  }
  return false;
};

// Function to determine if a string is a glob pattern
module.exports = function isGlob(str, options) {
  if (typeof str !== 'string' || str === '') return false;

  // Check for extended glob syntax
  if (isExtglob(str)) return true;

  // Choose the checking method based on options
  const check = options && options.strict === false ? relaxedCheck : strictCheck;

  // Execute the chosen checking method
  return check(str);
};
