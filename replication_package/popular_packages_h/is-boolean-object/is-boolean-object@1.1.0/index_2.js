'use strict';

const callBound = require('call-bind/callBound');
const boolToStr = callBound('Boolean.prototype.toString');
const objToStr = callBound('Object.prototype.toString');

const isBooleanObject = (value) => {
  try {
    boolToStr(value);
    return true;
  } catch {
    return false;
  }
};

const BOOLEAN_CLASS = '[object Boolean]';
const hasSymbolToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isBoolean(value) {
  if (typeof value === 'boolean') {
    return true;
  }
  if (value === null || typeof value !== 'object') {
    return false;
  }
  return hasSymbolToStringTag && Symbol.toStringTag in value 
    ? isBooleanObject(value) 
    : objToStr(value) === BOOLEAN_CLASS;
};
