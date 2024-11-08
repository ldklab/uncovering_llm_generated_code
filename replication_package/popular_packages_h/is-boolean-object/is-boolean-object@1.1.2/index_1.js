'use strict';

const callBound = require('call-bind/callBound');
const hasToStringTag = require('has-tostringtag/shams')();
const $boolToStr = callBound('Boolean.prototype.toString');
const $toString = callBound('Object.prototype.toString');
const boolClass = '[object Boolean]';

function tryBooleanObject(value) {
  try {
    $boolToStr(value);
    return true;
  } catch (e) {
    return false;
  }
}

function isBoolean(value) {
  if (typeof value === 'boolean') {
    return true;
  }
  if (value === null || typeof value !== 'object') {
    return false;
  }
  if (hasToStringTag && Symbol.toStringTag in value) {
    return tryBooleanObject(value);
  }
  return $toString(value) === boolClass;
}

module.exports = isBoolean;
