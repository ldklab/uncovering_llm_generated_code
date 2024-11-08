'use strict';

const { forEach } = require('for-each');
const availableTypedArrays = require('available-typed-arrays');
const { callBind, callBound } = require('call-bind');
const gOPD = require('gopd');
const hasToStringTag = require('has-tostringtag/shams')();

const $toString = callBound('Object.prototype.toString');
const globalObj = typeof globalThis === 'undefined' ? global : globalThis;
const typedArrays = availableTypedArrays();

const $slice = callBound('String.prototype.slice');
const getPrototypeOf = Object.getPrototypeOf;

const $indexOf = callBound('Array.prototype.indexOf', true) || function(array, value) {
  for (let i = 0; i < array.length; i += 1) {
    if (array[i] === value) {
      return i;
    }
  }
  return -1;
};

const cache = Object.create(null);
if (hasToStringTag && gOPD && getPrototypeOf) {
  forEach(typedArrays, (typedArray) => {
    const arr = new globalObj[typedArray]();
    if (Symbol.toStringTag in arr) {
      let proto = getPrototypeOf(arr);
      let descriptor = gOPD(proto, Symbol.toStringTag);
      if (!descriptor) {
        const superProto = getPrototypeOf(proto);
        descriptor = gOPD(superProto, Symbol.toStringTag);
      }
      cache['$' + typedArray] = callBind(descriptor.get);
    }
  });
} else {
  forEach(typedArrays, (typedArray) => {
    const arr = new globalObj[typedArray]();
    const fn = arr.slice || arr.set;
    if (fn) {
      cache['$' + typedArray] = callBind(fn);
    }
  });
}

const tryTypedArrays = function(value) {
  let found = false;
  forEach(cache, (getter, typedArray) => {
    if (!found) {
      try {
        if ('$' + getter(value) === typedArray) {
          found = $slice(typedArray, 1);
        }
      } catch (e) {}
    }
  });
  return found;
};

const trySlices = function(value) {
  let found = false;
  forEach(cache, (getter, name) => {
    if (!found) {
      try {
        getter(value);
        found = $slice(name, 1);
      } catch (e) {}
    }
  });
  return found;
};

module.exports = function whichTypedArray(value) {
  if (!value || typeof value !== 'object') return false;
  if (!hasToStringTag) {
    const tag = $slice($toString(value), 8, -1);
    if ($indexOf(typedArrays, tag) > -1) return tag;
    if (tag !== 'Object') return false;
    return trySlices(value);
  }
  if (!gOPD) return null;
  return tryTypedArrays(value);
};
