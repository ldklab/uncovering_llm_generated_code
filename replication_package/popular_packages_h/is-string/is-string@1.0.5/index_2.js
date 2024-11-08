'use strict';

function isStringPrimitive(value) {
  return typeof value === 'string';
}

function isNotObjectType(value) {
  return typeof value !== 'object';
}

function isStringObjectWithSymbolSupport(value) {
  try {
    String.prototype.valueOf.call(value);
    return true;
  } catch (e) {
    return false;
  }
}

function isStringObjectWithoutSymbolSupport(value) {
  const toStr = Object.prototype.toString;
  const strClass = '[object String]';
  return toStr.call(value) === strClass;
}

const hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isString(value) {
  if (isStringPrimitive(value)) {
    return true;
  }
  if (isNotObjectType(value)) {
    return false;
  }
  return hasToStringTag 
    ? isStringObjectWithSymbolSupport(value) 
    : isStringObjectWithoutSymbolSupport(value);
};
