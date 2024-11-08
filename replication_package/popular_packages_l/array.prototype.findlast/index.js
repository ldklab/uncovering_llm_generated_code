// index.js
(function() {
  'use strict';

  // Define the main function that finds the last element in the array for which the callback returns a truthy value
  function findLast(array, predicate) {
    if (array == null) {
      throw new TypeError('Array.prototype.findLast called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }

    var length = array.length >>> 0; // Convert length to a 32-bit unsigned integer
    for (var i = length - 1; i >= 0; i--) {
      if (i in array) {
        var value = array[i];
        if (predicate.call(arguments[2], value, i, array)) {
          return value;
        }
      }
    }
    return undefined;
  }

  // Gets the polyfill function
  function getPolyfill() {
    return typeof Array.prototype.findLast === 'function' ? Array.prototype.findLast : findLast;
  }

  // Shim method that ensures the function is on Array.prototype
  function shim() {
    var polyfill = getPolyfill();
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

  // Export the module
  var mainExport = findLast;
  mainExport.shim = shim;
  mainExport.getPolyfill = getPolyfill;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = mainExport;
  }
}());

// test.js
var assert = require('assert');
var findLast = require('./index');

// Test array and predicate
var arr = [1, [2], [], 3, [[4]]];
var isNumber = function (x) { return typeof x === 'number' };

// Test the main findLast function
assert.deepEqual(findLast(arr, isNumber), 3);

// Shim and test when not present
delete Array.prototype.findLast;
var shimmed = findLast.shim();
assert.equal(shimmed, findLast.getPolyfill());
assert.deepEqual(arr.findLast(isNumber), findLast(arr, isNumber));

// Shim and test when present
var shimmed = findLast.shim();
assert.equal(shimmed, Array.prototype.findLast);
assert.deepEqual(arr.findLast(isNumber), findLast(arr, isNumber));
