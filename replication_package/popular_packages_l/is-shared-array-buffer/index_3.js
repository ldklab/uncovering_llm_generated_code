// isSharedArrayBuffer.js
'use strict';

/**
 * Function to determine if a given value is a SharedArrayBuffer.
 * It checks if the value is an object and then verifies the
 * internal [[Class]] property of the object using Object.prototype.toString.
 * 
 * @param {any} value - The value to check.
 * @returns {boolean} - Returns true if the value is a SharedArrayBuffer, else false.
 */
function isSharedArrayBuffer(value) {
  // Check if the value is truthy and of type object
  if (!value || typeof value !== 'object') {
    return false;
  }

  // Check for the internal [[Class]] property to be 'SharedArrayBuffer'
  return Object.prototype.toString.call(value) === '[object SharedArrayBuffer]';
}

module.exports = isSharedArrayBuffer;

// test-isSharedArrayBuffer.js
'use strict';

const assert = require('assert');
const isSharedArrayBuffer = require('./isSharedArrayBuffer');

// Various tests asserting that given values are not SharedArrayBuffer
assert(!isSharedArrayBuffer(function () {})); // testing function
assert(!isSharedArrayBuffer(null)); // testing null
assert(!isSharedArrayBuffer(function* () { yield 42; return Infinity; })); // testing generator function
assert(!isSharedArrayBuffer(Symbol('foo'))); // testing symbol
assert(!isSharedArrayBuffer(1n)); // testing BigInt
assert(!isSharedArrayBuffer(Object(1n))); // testing BigInt object wrapper

// Testing various standard objects
assert(!isSharedArrayBuffer(new Set()));
assert(!isSharedArrayBuffer(new WeakSet()));
assert(!isSharedArrayBuffer(new Map()));
assert(!isSharedArrayBuffer(new WeakMap()));
assert(!isSharedArrayBuffer(new WeakRef({})));
assert(!isSharedArrayBuffer(new FinalizationRegistry(() => {})));
assert(!isSharedArrayBuffer(new ArrayBuffer())); // ArrayBuffer is not a SharedArrayBuffer

// Tests asserting that SharedArrayBuffer derived instances return true
assert(isSharedArrayBuffer(new SharedArrayBuffer()));

// Test with a subclass of SharedArrayBuffer
class MySharedArrayBuffer extends SharedArrayBuffer {}
assert(isSharedArrayBuffer(new MySharedArrayBuffer()));

console.log('All tests passed!');

// package.json
{
  "name": "is-shared-array-buffer",
  "version": "1.0.0",
  "description": "Determine if a value is a JS SharedArrayBuffer.",
  "main": "isSharedArrayBuffer.js",
  "scripts": {
    "test": "node test-isSharedArrayBuffer.js"
  },
  "author": "",
  "license": "MIT"
}
