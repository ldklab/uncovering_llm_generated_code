markdown
// is-number-object/index.js

'use strict';

function isNumber(value) {
  // Determine if the value is a number or a Number object
  // First check for primitive number
  if (typeof value === 'number') {
    return true;
  }
  // Check for Number object using Object.prototype.toString
  if (typeof value === 'object') {
    return Object.prototype.toString.call(value) === '[object Number]';
  }
  // Return false if neither
  return false;
}

module.exports = isNumber;
