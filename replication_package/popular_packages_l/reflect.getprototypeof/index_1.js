(function () {
  'use strict';

  // Implements a polyfill for Reflect.getPrototypeOf
  function implementation(obj) {
    if (typeof obj !== 'object' || obj === null) {
      throw new TypeError(obj + ' is not an object');
    }
    if (Object.getPrototypeOf) {
      return Object.getPrototypeOf(obj);
    }
    return obj.__proto__ || null; // Fallback for environments with __proto__ support
  }

  // Determines the polyfill to use for Reflect.getPrototypeOf
  function getPolyfill() {
    if (typeof Reflect !== 'undefined' && typeof Reflect.getPrototypeOf === 'function') {
      return Reflect.getPrototypeOf;
    }
    return implementation;
  }

  // Sets up the Reflect.getPrototypeOf method if it isn't present
  function shim() {
    var polyfill = getPolyfill();
    if (typeof Reflect === 'undefined') {
      globalThis.Reflect = {};
    }
    Reflect.getPrototypeOf = polyfill;
    return polyfill; // Returns the polyfill that is actually used
  }

  // Exports functions for external usage
  module.exports = {
    getPolyfill: getPolyfill,
    implementation: implementation,
    shim: shim
  };
})();

// Test cases for the functionality
var getPrototypeOf = require('./reflect.getprototypeof');
var assert = require('assert');

// Test function wrapping
(function(){
  var shimmed = getPrototypeOf.shim(); // Shim Reflect.getPrototypeOf
  assert.equal(shimmed, getPrototypeOf.getPolyfill()); // Ensure shim returns the used polyfill

  try {
    // Ensure TypeError is thrown when non-object is passed
    assert.throws(() => getPrototypeOf.getPolyfill()(true));
    assert.throws(() => getPrototypeOf.getPolyfill()(42));
    assert.throws(() => getPrototypeOf.getPolyfill()(''));

    // Verify prototype retrieval for various object types
    assert.equal(getPrototypeOf.getPolyfill()(/a/g), RegExp.prototype);
    assert.equal(getPrototypeOf.getPolyfill()(new Date()), Date.prototype);
    assert.equal(getPrototypeOf.getPolyfill()(function () {}), Function.prototype);
    assert.equal(getPrototypeOf.getPolyfill()([]), Array.prototype);
    assert.equal(getPrototypeOf.getPolyfill()({}), Object.prototype);
    
    console.log('All tests passed'); // Log success message
  } catch (e) {
    console.error('Test failed', e); // Log failure message with error
  }
})();
