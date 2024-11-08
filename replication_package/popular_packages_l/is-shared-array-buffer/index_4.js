// is-shared-array-buffer.js
'use strict';

// Function to check if given value is a SharedArrayBuffer
function isSharedArrayBuffer(value) {
  // If value is not an object or is null, return false
  if (!value || typeof value !== 'object') {
    return false;
  }

  // Check the internal [[Class]] property of the object using Object.prototype.toString
  // Return true if the value is a SharedArrayBuffer, otherwise false
  return Object.prototype.toString.call(value) === '[object SharedArrayBuffer]';
}

// Export the function to be used in other modules
module.exports = isSharedArrayBuffer;

// test-is-shared-array-buffer.js
'use strict';

// Import necessary modules: assert for testing and the function to check SharedArrayBuffer
const assert = require('assert');
const isSharedArrayBuffer = require('./is-shared-array-buffer');

// Test cases to ensure isSharedArrayBuffer function works as expected

// Testing with different types, should return false
assert(!isSharedArrayBuffer(function () {}));
assert(!isSharedArrayBuffer(null));
assert(!isSharedArrayBuffer(function* () { yield 42; return Infinity; }));
assert(!isSharedArrayBuffer(Symbol('foo')));
assert(!isSharedArrayBuffer(1n));
assert(!isSharedArrayBuffer(Object(1n)));
assert(!isSharedArrayBuffer(new Set()));
assert(!isSharedArrayBuffer(new WeakSet()));
assert(!isSharedArrayBuffer(new Map()));
assert(!isSharedArrayBuffer(new WeakMap()));
assert(!isSharedArrayBuffer(new WeakRef({})));
assert(!isSharedArrayBuffer(new FinalizationRegistry(() => {})));
assert(!isSharedArrayBuffer(new ArrayBuffer()));

// Testing actual SharedArrayBuffer, should return true
assert(isSharedArrayBuffer(new SharedArrayBuffer()));

// Testing inheritance from SharedArrayBuffer, should return true
class MySharedArrayBuffer extends SharedArrayBuffer {}
assert(isSharedArrayBuffer(new MySharedArrayBuffer()));

// Log success message if all tests pass
console.log('All tests passed!');

// package.json
{
  "name": "is-shared-array-buffer",
  "version": "1.0.0",
  "description": "Determine if a value is a JS SharedArrayBuffer.",
  "main": "is-shared-array-buffer.js",
  "scripts": {
    "test": "node test-is-shared-array-buffer.js"
  },
  "author": "",
  "license": "MIT"
}
