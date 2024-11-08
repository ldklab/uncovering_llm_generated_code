// index.js
(function() {
  'use strict';

  // Function to find the last element satisfying the predicate
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

  // Function to retrieve the appropriate polyfill
  function getPolyfill() {
    return typeof Array.prototype.findLast === 'function' ? Array.prototype.findLast : findLast;
  }

  // Shim to add the polyfill to Array.prototype if needed
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

  // Export the findLast function and related utilities
  const mainExport = findLast;
  mainExport.shim = shim;
  mainExport.getPolyfill = getPolyfill;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = mainExport;
  }
}());

// test.js
const assert = require('assert');
const findLast = require('./index');

// Sample array and predicate for testing
const arr = [1, [2], [], 3, [[4]]];
const isNumber = (x) => typeof x === 'number';

// Test findLast function
assert.strictEqual(findLast(arr, isNumber), 3);

// Test shim when Array.prototype.findLast is absent
delete Array.prototype.findLast;
const shimmed = findLast.shim();
assert.strictEqual(shimmed, findLast.getPolyfill());
assert.strictEqual(arr.findLast(isNumber), findLast(arr, isNumber));

// Test shim when Array.prototype.findLast is present
const reshimmmed = findLast.shim();
assert.strictEqual(reshimmmed, Array.prototype.findLast);
assert.strictEqual(arr.findLast(isNumber), findLast(arr, isNumber));
