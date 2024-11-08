(function () {
  'use strict';

  // Function to determine the prototype of an object, used as a polyfill
  function implementation(obj) {
    if (typeof obj !== 'object' || obj === null) {
      throw new TypeError(obj + ' is not an object');
    }
    // Checks if Object.getPrototypeOf is available, otherwise falls back to __proto__
    if (Object.getPrototypeOf) {
      return Object.getPrototypeOf(obj);
    }
    return obj.__proto__ || null;
  }

  // Provides the suitable getPrototypeOf method: native Reflect or the implementation
  function getPolyfill() {
    if (typeof Reflect !== 'undefined' && typeof Reflect.getPrototypeOf === 'function') {
      return Reflect.getPrototypeOf;
    }
    return implementation;
  }

  // Ensures Reflect.getPrototypeOf is available in the environment
  function shim() {
    var polyfill = getPolyfill();
    if (typeof Reflect === 'undefined') {
      globalThis.Reflect = {};
    }
    Reflect.getPrototypeOf = polyfill;
    return polyfill;
  }

  // Export functions for usage in other modules
  module.exports = {
    getPolyfill: getPolyfill,
    implementation: implementation,
    shim: shim
  };
})();

// Test cases to verify the functionality of the shimmed getPrototypeOf
var getPrototypeOf = require('./reflect.getprototypeof');
var assert = require('assert');

(function(){
  var shimmed = getPrototypeOf.shim();
  assert.equal(shimmed, getPrototypeOf.getPolyfill());

  try {
    assert.throws(() => getPrototypeOf.getPolyfill()(true), 'Expected TypeError not thrown for boolean');
    assert.throws(() => getPrototypeOf.getPolyfill()(42), 'Expected TypeError not thrown for number');
    assert.throws(() => getPrototypeOf.getPolyfill()(''), 'Expected TypeError not thrown for string');
    assert.equal(getPrototypeOf.getPolyfill()(/a/g), RegExp.prototype, 'Prototype of RegExp');
    assert.equal(getPrototypeOf.getPolyfill()(new Date()), Date.prototype, 'Prototype of Date');
    assert.equal(getPrototypeOf.getPolyfill()(function () {}), Function.prototype, 'Prototype of Function');
    assert.equal(getPrototypeOf.getPolyfill()([]), Array.prototype, 'Prototype of Array');
    assert.equal(getPrototypeOf.getPolyfill()({}), Object.prototype, 'Prototype of Object');
    
    console.log('All tests passed');
  } catch (e) {
    console.error('Test failed', e);
  }
})();
