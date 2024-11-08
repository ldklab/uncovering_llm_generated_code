// is-number-object/index.js

'use strict';

const isNumber = (value) => {
  if (typeof value === 'number') {
    return true;
  }

  if (typeof value === 'object') {
    return Object.prototype.toString.call(value) === '[object Number]';
  }

  return false;
};

module.exports = isNumber;
