const isExtglob = require('is-extglob');

const chars = { '{': '}', '(': ')', '[': ']' };

function strictCheck(str) {
  if (str.startsWith('!')) return true;

  let index = 0;
  let indices = { pipe: -2, closeSquare: -2, closeCurly: -2, closeParen: -2, backSlash: -2 };

  while (index < str.length) {
    const char = str[index];

    if (char === '*') return true;

    if (str[index + 1] === '?' && /[\].+)]/.test(char)) return true;

    updateIndices(str[index] === '[', str, index, indices, 'closeSquare', '[');

    if (checkIndices(indices.closeSquare, index, ']', str, indices)) return true;

    updateIndices(str[index] === '{', str, index, indices, 'closeCurly', '{');

    if (str[index] === '\\') {
      const nextChar = str[index + 1];
      index += 2;
      const closeChar = chars[nextChar];

      if (closeChar) {
        const n = str.indexOf(closeChar, index);
        if (n !== -1) index = n + 1;
      }

      if (str[index] === '!') return true;
    } else {
      index++;
    }
  }
  return false;

  function updateIndices(condition, str, index, indices, closeType, openChar) {
    if (condition && str[index + 1] !== chars[openChar]) {
      indices[closeType] = str.indexOf(chars[openChar], index);
    }
  }

  function checkIndices(closeTypeIndex, currentIndex, closeChar, str, indices) {
    if (closeTypeIndex > currentIndex) {
      indices.backSlash = str.indexOf('\\', currentIndex);
      if (indices.backSlash === -1 || indices.backSlash > closeTypeIndex) return true;
    }
    return false;
  }
}

function relaxedCheck(str) {
  if (str.startsWith('!')) return true;

  let index = 0;

  while (index < str.length) {
    if (/[*?{}()[\]]/.test(str[index])) return true;

    if (str[index] === '\\') {
      const nextChar = str[index + 1];
      index += 2;
      const closeChar = chars[nextChar];

      if (closeChar) {
        const n = str.indexOf(closeChar, index);
        if (n !== -1) index = n + 1;
      }

      if (str[index] === '!') return true;
    } else {
      index++;
    }
  }
  return false;
}

module.exports = function isGlob(str, options) {
  if (typeof str !== 'string' || str === '') return false;

  if (isExtglob(str)) return true;

  const check = (options && options.strict === false) ? relaxedCheck : strictCheck;

  return check(str);
};
