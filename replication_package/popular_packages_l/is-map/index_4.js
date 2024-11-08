// is-map/index.js
// This function checks if the provided value is an instance of Map.
// It performs this check by utilizing `Object.prototype.toString.call(value)`
// which returns '[object Map]' if the value is a Map.
function isMap(value) {
  return Object.prototype.toString.call(value) === '[object Map]';
}

// Export the isMap function to be used in other modules.
module.exports = isMap;

// is-map/test/test.js
// This file contains test cases for the isMap function using Node.js assert module.
const assert = require('assert');
const isMap = require('../index');

// Test suite named 'is-Map tests'
describe('is-Map tests', function() {
  // Test case to verify that isMap returns false for non-Map values
  it('should return false for non-Map values', function() {
    assert(!isMap(function () {})); // Function
    assert(!isMap(null));           // null
    assert(!isMap(function* () { yield 42; return Infinity; })); // Generator function
    assert(!isMap(Symbol('foo')));  // Symbol
    assert(!isMap(1n));             // BigInt primitive
    assert(!isMap(Object(1n)));     // BigInt object
    assert(!isMap(new Set()));      // Set object
    assert(!isMap(new WeakSet()));  // WeakSet object
    assert(!isMap(new WeakMap()));  // WeakMap object
  });

  // Test case to verify that isMap returns true for Map instances
  it('should return true for Map instances', function() {
    assert(isMap(new Map())); // Confirming that a new Map is seen as a Map
    class MyMap extends Map {} // Creating a class that extends from Map
    assert(isMap(new MyMap())); // Confirming that an instance of MyMap is seen as a Map
  });
});

// package.json
// The package specifies information about the 'is-map' module including how to test it using mocha.
{
  "name": "is-map",
  "version": "1.0.0",
  "description": "Is this value a JS Map? This module works cross-realm/iframe, and despite ES6 @@toStringTag.",
  "main": "index.js",
  "scripts": {
    "test": "mocha" // Command to run the test cases
  },
  "author": "", // No author specified
  "license": "MIT", // MIT license for open source
  "devDependencies": {
    "mocha": "^10.0.0" // Mocha testing framework is a development dependency
  }
}
