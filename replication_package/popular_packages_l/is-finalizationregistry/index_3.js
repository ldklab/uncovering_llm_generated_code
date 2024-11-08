// is-finalizationregistry.js
'use strict';

// Function to check if a given value is an instance of FinalizationRegistry
function isFinalizationRegistry(value) {
  // Ensure the value is an object and not null
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  
  // Check if the value is constructed by a function and check its prototype
  // Verify the value is an instance of its constructor and matches FinalizationRegistry signature
  return typeof value.constructor === 'function' &&
         value.constructor.prototype &&
         value instanceof value.constructor &&
         (Object.prototype.toString.call(value) === '[object FinalizationRegistry]' ||
          Object.prototype.toString.call(value) === '[object Object]' &&
          value.constructor.name === 'FinalizationRegistry');
}

// Export the function for use in other modules
module.exports = isFinalizationRegistry;

// test.js
'use strict';

// Import built-in assert module and the isFinalizationRegistry function
var assert = require('assert');
var isFinalizationRegistry = require('./is-finalizationregistry');

// Test Cases to validate the functionality of isFinalizationRegistry
assert(!isFinalizationRegistry(function () {})); // a simple function
assert(!isFinalizationRegistry(null)); // null value
assert(!isFinalizationRegistry(function* () { yield 42; return Infinity; })); // generator function
assert(!isFinalizationRegistry(Symbol('foo'))); // Symbol
assert(!isFinalizationRegistry(1n)); // BigInt
assert(!isFinalizationRegistry(Object(1n))); // Object wrapped BigInt

// Check various non-FinalizationRegistry collection types
assert(!isFinalizationRegistry(new Set()));
assert(!isFinalizationRegistry(new WeakSet()));
assert(!isFinalizationRegistry(new Map()));
assert(!isFinalizationRegistry(new WeakMap()));
assert(!isFinalizationRegistry(new WeakRef({})));

// Positive test case with an instance of FinalizationRegistry
assert(isFinalizationRegistry(new FinalizationRegistry(function () {})));

// Check with a subclass of FinalizationRegistry
class MyFinalizationRegistry extends FinalizationRegistry {}
assert(isFinalizationRegistry(new MyFinalizationRegistry(function () {})));

// Log success message if all assertions pass
console.log('All tests passed!');

// package.json
{
  "name": "is-finalizationregistry",
  "version": "1.0.0",
  "description": "Check if a value is a JS FinalizationRegistry",
  "main": "is-finalizationregistry.js",
  "scripts": {
    "test": "node test.js"
  },
  "keywords": [
    "FinalizationRegistry",
    "type-checking",
    "javascript"
  ],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "assert": "^2.0.0"
  }
}
