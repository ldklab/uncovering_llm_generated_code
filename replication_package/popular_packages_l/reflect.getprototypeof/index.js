(function () {
  'use strict';

  // Define our polyfill function for Reflect.getPrototypeOf
  function implementation(obj) {
    if (typeof obj !== 'object' || obj === null) {
      throw new TypeError(obj + ' is not an object');
    }
    if (Object.getPrototypeOf) {
      return Object.getPrototypeOf(obj);
    }
    // Fallback for engines with __proto__ support
    return obj.__proto__ || null;
  }

  // Function to get the polyfill
  function getPolyfill() {
    if (typeof Reflect !== 'undefined' && typeof Reflect.getPrototypeOf === 'function') {
      return Reflect.getPrototypeOf;
    }
    return implementation;
  }

  // Shim method to patch Reflect.getPrototypeOf
  function shim() {
    var polyfill = getPolyfill();
    if (typeof Reflect === 'undefined') {
      globalThis.Reflect = {};
    }
    Reflect.getPrototypeOf = polyfill;
    return polyfill;
  }

  // Export our main module
  module.exports = {
    getPolyfill: getPolyfill,
    implementation: implementation,
    shim: shim
  };
})();

// Test cases
var getPrototypeOf = require('./reflect.getprototypeof');
var assert = require('assert');

(function(){
  var shimmed = getPrototypeOf.shim();
  assert.equal(shimmed, getPrototypeOf.getPolyfill());

  try {
    assert.throws(() => getPrototypeOf.getPolyfill()(true));
    assert.throws(() => getPrototypeOf.getPolyfill()(42));
    assert.throws(() => getPrototypeOf.getPolyfill()(''));
    assert.equal(getPrototypeOf.getPolyfill()(/a/g), RegExp.prototype);
    assert.equal(getPrototypeOf.getPolyfill()(new Date()), Date.prototype);
    assert.equal(getPrototypeOf.getPolyfill()(function () {}), Function.prototype);
    assert.equal(getPrototypeOf.getPolyfill()([]), Array.prototype);
    assert.equal(getPrototypeOf.getPolyfill()({}), Object.prototype);
    
    console.log('All tests passed');
  } catch (e) {
    console.error('Test failed', e);
  }
})();
