'use strict';

const forEach = require('for-each');
const availableTypedArrays = require('available-typed-arrays');
const callBind = require('call-bind');
const callBound = require('call-bind/callBound');
const gOPD = require('gopd');
const hasToStringTag = require('has-tostringtag/shams')();

const $toString = callBound('Object.prototype.toString');
const globalScope = typeof globalThis === 'undefined' ? global : globalThis;
const typedArrays = availableTypedArrays();
const $slice = callBound('String.prototype.slice');
const getPrototypeOf = Object.getPrototypeOf;

const $indexOf = callBound('Array.prototype.indexOf', true) || function indexOf(array, value) {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === value) {
      return i;
    }
  }
  return -1;
};

let cache = Object.create(null);

if (hasToStringTag && gOPD && getPrototypeOf) {
  forEach(typedArrays, (typedArray) => {
    const arr = new globalScope[typedArray]();
    if (Symbol.toStringTag in arr) {
      let proto = getPrototypeOf(arr);
      let descriptor = gOPD(proto, Symbol.toStringTag) || gOPD(getPrototypeOf(proto), Symbol.toStringTag);
      if (descriptor) {
        cache[`$${typedArray}`] = callBind(descriptor.get);
      }
    }
  });
} else {
  forEach(typedArrays, (typedArray) => {
    const arr = new globalScope[typedArray]();
    const fn = arr.slice || arr.set;
    if (fn) {
      cache[`$${typedArray}`] = callBind(fn);
    }
  });
}

function tryTypedArrays(value) {
  let found = false;
  forEach(cache, (getter, typedArray) => {
    if (!found) {
      try {
        if (`$${getter(value)}` === typedArray) {
          found = $slice(typedArray, 1);
        }
      } catch (e) {}
    }
  });
  return found;
}

function trySlices(value) {
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
}

module.exports = function whichTypedArray(value) {
  if (!value || typeof value !== 'object') return false;

  if (!hasToStringTag) {
    const tag = $slice($toString(value), 8, -1);
    if ($indexOf(typedArrays, tag) > -1) return tag;
    return tag !== 'Object' ? false : trySlices(value);
  }

  return gOPD ? tryTypedArrays(value) : null;
};
