markdown
// is-number/index.js
'use strict';

/**
 * Check if a value is a number.
 *
 * @param {*} value - The value to check.
 * @return {boolean} - Returns true if the value is a finite number.
 */
function isNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return true;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    return Number.isFinite(+value);
  }

  return false;
}

module.exports = isNumber;

// Usage Example
// const isNumber = require('./index');

// console.log(isNumber(5e3));          // true
// console.log(isNumber(0xff));         // true
// console.log(isNumber(-1.1));         // true
// console.log(isNumber('5e3'));        // true
// console.log(isNumber('  '));         // false
// console.log(isNumber([1]));          // false
// console.log(isNumber(NaN));          // false
// console.log(isNumber(null));         // false
