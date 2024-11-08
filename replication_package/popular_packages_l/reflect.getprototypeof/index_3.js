(function () {
  'use strict';

  // Implement a polyfill for Reflect.getPrototypeOf
  function implementation(obj) {
    if (typeof obj !== 'object' || obj === null) {
      throw new TypeError(obj + ' is not an object');
    }
    // Use native Object.getPrototypeOf if available
    if (Object.getPrototypeOf) {
      return Object.getPrototypeOf(obj);
    }
    // Fallback using __proto__
    return obj.__proto__ || null;
  }

  // Determine the polyfill to use
  function getPolyfill() {
    if (typeof Reflect !== 'undefined' && typeof Reflect.getPrototypeOf === 'function') {
      return Reflect.getPrototypeOf;
    }
    return implementation;
  }

  // Shim to install the polyfill
  function shim() {
    var polyfill = getPolyfill();
    if (typeof Reflect === 'undefined') {
      globalThis.Reflect = {};
    }
    Reflect.getPrototypeOf = polyfill;
    return polyfill;
  }

  // Export the module functions
  module.exports = {
    getPolyfill: getPolyfill,
    implementation: implementation,
    shim: shim
  };
})();

const getPrototypeOf = require('./reflect.getprototypeof');
const assert = require('assert');

(function(){
  const shimmed = getPrototypeOf.shim();
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
