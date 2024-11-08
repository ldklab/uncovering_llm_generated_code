markdown
// is-number-object/index.js

'use strict';

function isNumber(value) {
  // Check for number object using Object prototype
  return typeof value === 'number' || 
    (typeof value === 'object' && Object.prototype.toString.call(value) === '[object Number]');
}

module.exports = isNumber;
