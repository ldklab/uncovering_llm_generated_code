'use strict';

const callBound = require('call-bind/callBound');
const hasToStringTag = require('has-tostringtag/shams')();
const $hasOwnProperty = callBound('Object.prototype.hasOwnProperty');
const $exec = callBound('RegExp.prototype.exec');
const $toString = callBound('Object.prototype.toString');
const gOPD = Object.getOwnPropertyDescriptor;

const isRegexMarker = {};
const regexClass = '[object RegExp]';

let badStringifier;

if (hasToStringTag) {
  const throwRegexMarker = () => { throw isRegexMarker; };
  
  badStringifier = {
    toString: throwRegexMarker,
    valueOf: throwRegexMarker
  };

  if (typeof Symbol.toPrimitive === 'symbol') {
    badStringifier[Symbol.toPrimitive] = throwRegexMarker;
  }
}

function isRegex(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (hasToStringTag) {
    const descriptor = gOPD(value, 'lastIndex');
    const hasLastIndexDataProperty = descriptor && $hasOwnProperty(descriptor, 'value');
    if (!hasLastIndexDataProperty) {
      return false;
    }

    try {
      $exec(value, badStringifier);
    } catch (e) {
      return e === isRegexMarker;
    }
  } else {
    if (typeof value === 'object' || typeof value === 'function') {
      return $toString(value) === regexClass;
    }
    return false;
  }
}

module.exports = isRegex;
