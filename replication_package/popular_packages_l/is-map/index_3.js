// is-map/index.js
function isMap(value) {
  // Check if the provided value is an instance of Map using Object.prototype.toString
  return Object.prototype.toString.call(value) === '[object Map]';
}

// Export the isMap function so it can be used in other files
module.exports = isMap;

// is-map/test/test.js
const assert = require('assert'); // Node.js module for assertions in tests
const isMap = require('../index'); // Import the isMap function from the module

// Define a group of tests with Mocha
describe('is-Map tests', function() {
  
  // Test case for values that should not be considered a Map
  it('should return false for non-Map values', function() {
    assert(!isMap(function () {})); // Function
    assert(!isMap(null)); // Null
    assert(!isMap(function* () { yield 42; return Infinity; })); // Generator function
    assert(!isMap(Symbol('foo'))); // Symbol
    assert(!isMap(1n)); // BigInt literal
    assert(!isMap(Object(1n))); // BigInt object
    assert(!isMap(new Set())); // Set
    assert(!isMap(new WeakSet())); // WeakSet
    assert(!isMap(new WeakMap())); // WeakMap
  });

  // Test case for instances of Map
  it('should return true for Map instances', function() {
    assert(isMap(new Map())); // Map instance
    class MyMap extends Map {} // Subclass of Map
    assert(isMap(new MyMap())); // Instance of subclass of Map
  });
});

// package.json
{
  "name": "is-map",
  "version": "1.0.0",
  "description": "Is this value a JS Map? This module works cross-realm/iframe, and despite ES6 @@toStringTag.",
  "main": "index.js",
  "scripts": {
    "test": "mocha" // Script for running tests with Mocha
  },
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "mocha": "^10.0.0" // Development dependency for Mocha, a test framework
  }
}
