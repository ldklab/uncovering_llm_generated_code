// is-map/index.js
/**
 * Determines if a given value is a Map object.
 * 
 * This function uses Object.prototype.toString to identify the string tag 
 * associated with the object. If the tag is '[object Map]', it confirms 
 * the object is a Map.
 * 
 * @param {any} value - The value to be checked.
 * @returns {boolean} - True if the value is a Map object, false otherwise.
 */
function isMap(value) {
  return Object.prototype.toString.call(value) === '[object Map]';
}

module.exports = isMap;

// is-map/test/test.js
const assert = require('assert');
const isMap = require('../index');

// Test suite for the isMap function
describe('is-Map tests', function() {
  // Test case: Check non-Map values
  it('should return false for non-Map values', function() {
    assert(!isMap(function () {})); // Function is not a Map
    assert(!isMap(null)); // null is not a Map
    assert(!isMap(function* () { yield 42; return Infinity; })); // Generator is not a Map
    assert(!isMap(Symbol('foo'))); // Symbol is not a Map
    assert(!isMap(1n)); // BigInt is not a Map
    assert(!isMap(Object(1n))); // BigInt object is not a Map
    assert(!isMap(new Set())); // Set is not a Map
    assert(!isMap(new WeakSet())); // WeakSet is not a Map
    assert(!isMap(new WeakMap())); // WeakMap is not a Map
  });

  // Test case: Check Map instances
  it('should return true for Map instances', function() {
    assert(isMap(new Map())); // Basic Map instance
    class MyMap extends Map {} // Inherited Map instance
    assert(isMap(new MyMap()));
  });
});

// package.json
{
  "name": "is-map",
  "version": "1.0.0",
  "description": "Is this value a JS Map? This module works cross-realm/iframe, and despite ES6 @@toStringTag.",
  "main": "index.js",
  "scripts": {
    "test": "mocha"
  },
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "mocha": "^10.0.0"
  }
}
