// is-number-object/index.js

'use strict';

function isNumber(value) {
  // Confirm if the value is a number primitive or a Number object
  if (typeof value === 'number') {
    return true;
  }
  
  if (typeof value === 'object' && Object.prototype.toString.call(value) === '[object Number]') {
    return true;
  }

  return false;
}

module.exports = isNumber;
