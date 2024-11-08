'use strict';

function isNegativeZero(number) {
  if (number === 0) {
    const result = 1 / number;
    return result === -Infinity;
  }
  return false;
}

module.exports = isNegativeZero;
