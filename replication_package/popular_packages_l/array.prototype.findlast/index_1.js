// index.js
(() => {
  'use strict';

  function findLast(array, predicate) {
    if (array == null) {
      throw new TypeError('Array.prototype.findLast called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }

    const length = array.length >>> 0;
    for (let i = length - 1; i >= 0; i--) {
      if (i in array) {
        const value = array[i];
        if (predicate.call(arguments[2], value, i, array)) {
          return value;
        }
      }
    }
    return undefined;
  }

  function getPolyfill() {
    return typeof Array.prototype.findLast === 'function' ? Array.prototype.findLast : findLast;
  }

  function shim() {
    const polyfill = getPolyfill();
    if (Array.prototype.findLast !== polyfill) {
      Object.defineProperty(Array.prototype, 'findLast', {
        value: polyfill,
        configurable: true,
        writable: true,
        enumerable: false
      });
    }
    return polyfill;
  }

  const mainExport = findLast;
  mainExport.shim = shim;
  mainExport.getPolyfill = getPolyfill;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = mainExport;
  }
})();

// test.js
const assert = require('assert');
const findLast = require('./index');

const arr = [1, [2], [], 3, [[4]]];
const isNumber = (x) => typeof x === 'number';

assert.deepEqual(findLast(arr, isNumber), 3);

delete Array.prototype.findLast;
const shimmed1 = findLast.shim();
assert.equal(shimmed1, findLast.getPolyfill());
assert.deepEqual(arr.findLast(isNumber), findLast(arr, isNumber));

const shimmed2 = findLast.shim();
assert.equal(shimmed2, Array.prototype.findLast);
assert.deepEqual(arr.findLast(isNumber), findLast(arr, isNumber));
