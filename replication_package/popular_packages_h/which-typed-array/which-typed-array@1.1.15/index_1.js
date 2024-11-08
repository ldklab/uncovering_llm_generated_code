'use strict';

const forEach = require('for-each');
const availableTypedArrays = require('available-typed-arrays');
const callBind = require('call-bind');
const callBound = require('call-bind/callBound');
const gOPD = require('gopd');

const $toString = callBound('Object.prototype.toString');
const hasToStringTag = require('has-tostringtag/shams')();

const globalRef = typeof globalThis === 'undefined' ? global : globalThis;
const typedArraysList = availableTypedArrays();

const $slice = callBound('String.prototype.slice');
const getPrototypeOf = Object.getPrototypeOf;

const $indexOf = callBound('Array.prototype.indexOf', true) || function(array, value) {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === value) {
      return i;
    }
  }
  return -1;
};

const cache = { __proto__: null };
if (hasToStringTag && gOPD && getPrototypeOf) {
  forEach(typedArraysList, function(typedArray) {
    const arr = new globalRef[typedArray]();
    if (Symbol.toStringTag in arr) {
      let proto = getPrototypeOf(arr);
      let descriptor = gOPD(proto, Symbol.toStringTag);
      if (!descriptor) {
        proto = getPrototypeOf(proto);
        descriptor = gOPD(proto, Symbol.toStringTag);
      }
      cache['$' + typedArray] = callBind(descriptor.get);
    }
  });
} else {
  forEach(typedArraysList, function(typedArray) {
    const arr = new globalRef[typedArray]();
    const fn = arr.slice || arr.set;
    if (fn) {
      cache['$' + typedArray] = callBind(fn);
    }
  });
}

function tryTypedArrays(value) {
  let found = false;
  forEach(cache, function(getter, typedArray) {
    if (!found) {
      try {
        if ('$' + getter(value) === typedArray) {
          found = $slice(typedArray, 1);
        }
      } catch (e) {}
    }
  });
  return found;
}

function trySlices(value) {
  let found = false;
  forEach(cache, function(getter, name) {
    if (!found) {
      try {
        getter(value);
        found = $slice(name, 1);
      } catch (e) {}
    }
  });
  return found;
}

module.exports = function whichTypedArray(value) {
  if (!value || typeof value !== 'object') return false;
  if (!hasToStringTag) {
    const tag = $slice($toString(value), 8, -1);
    if ($indexOf(typedArraysList, tag) > -1) {
      return tag;
    }
    if (tag !== 'Object') {
      return false;
    }
    return trySlices(value);
  }
  if (!gOPD) return null;
  return tryTypedArrays(value);
};
