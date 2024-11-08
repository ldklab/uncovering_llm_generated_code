(function () {
  'use strict';

  // This function provides a polyfill implementation for Reflect.getPrototypeOf.
  function implementation(obj) {
    if (typeof obj !== 'object' || obj === null) {
      throw new TypeError(obj + ' is not an object');
    }
    if (Object.getPrototypeOf) {
      return Object.getPrototypeOf(obj);
    }
    return obj.__proto__ || null; // Fallback for engines with __proto__.
  }

  // This function retrieves the polyfill, prioritizing native implementations of Reflect.getPrototypeOf.
  function getPolyfill() {
    if (typeof Reflect !== 'undefined' && typeof Reflect.getPrototypeOf === 'function') {
      return Reflect.getPrototypeOf;
    }
    return implementation;
  }

  // This function modifies the global Reflect object to ensure getPrototypeOf is present.
  function shim() {
    var polyfill = getPolyfill();
    if (typeof Reflect === 'undefined') {
      globalThis.Reflect = {}; // Define Reflect in the global scope if not existing.
    }
    Reflect.getPrototypeOf = polyfill; // Assign getPrototypeOf with either native or polyfill method.
    return polyfill;
  }

  // Export the functions for external use.
  module.exports = {
    getPolyfill: getPolyfill,
    implementation: implementation,
    shim: shim
  };
})();

// Test suite for the Reflect.getPrototypeOf functionality.
var getPrototypeOf = require('./reflect.getprototypeof');
var assert = require('assert');

(function() {
  var shimmed = getPrototypeOf.shim();
  assert.equal(shimmed, getPrototypeOf.getPolyfill());

  try {
    // Test cases for throwing exceptions on non-object types.
    assert.throws(() => getPrototypeOf.getPolyfill()(true));
    assert.throws(() => getPrototypeOf.getPolyfill()(42));
    assert.throws(() => getPrototypeOf.getPolyfill()(''));

    // Validate correct prototype access for various objects.
    assert.equal(getPrototypeOf.getPolyfill()(/a/g), RegExp.prototype);
    assert.equal(getPrototypeOf.getPolyfill()(new Date()), Date.prototype);
    assert.equal(getPrototypeOf.getPolyfill()(function () {}), Function.prototype);
    assert.equal(getPrototypeOf.getPolyfill()([]), Array.prototype);
    assert.equal(getPrototypeOf.getPolyfill()({}), Object.prototype);

    console.log('All tests passed');
  } catch (e) {
    console.error('Test failed', e); // Error logging for any failing test cases.
  }
})();
