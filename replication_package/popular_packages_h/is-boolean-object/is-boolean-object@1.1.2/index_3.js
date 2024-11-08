'use strict';

const callBound = require('call-bind/callBound');
const $boolToStr = callBound('Boolean.prototype.toString');
const $toString = callBound('Object.prototype.toString');
const hasToStringTag = require('has-tostringtag/shams')();

const isPlainBoolean = (value) => typeof value === 'boolean';

const tryBooleanObject = (value) => {
  try {
    $boolToStr(value);
    return true;
  } catch {
    return false;
  }
};

module.exports = function isBoolean(value) {
  if (isPlainBoolean(value)) {
    return true;
  }
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const boolClass = '[object Boolean]';
  const isSymbolToStringTagSupported = hasToStringTag && Symbol.toStringTag in value;
  
  return isSymbolToStringTagSupported ? tryBooleanObject(value) : $toString(value) === boolClass;
};
