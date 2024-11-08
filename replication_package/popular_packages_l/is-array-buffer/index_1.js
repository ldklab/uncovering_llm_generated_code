// is-array-buffer.js

'use strict';

/**
 * Function to check if a given value is an ArrayBuffer.
 * It uses Object.prototype.toString to determine the object's internal [[Class]] property.
 *
 * @param {*} value - The value to check.
 * @returns {boolean} - Returns true if the value is an ArrayBuffer, otherwise false.
 */
function isArrayBuffer(value) {
  // Check for null or undefined
  if (value == null) {
    return false;
  }

  // Use Object.prototype.toString to check for '[object ArrayBuffer]' type
  return Object.prototype.toString.call(value) === '[object ArrayBuffer]';
}

// Export the function for use in other modules
module.exports = isArrayBuffer;

// test.js

// Import the built-in assert module for assertions
var assert = require('assert');
// Import the isArrayBuffer function to test
var isArrayBuffer = require('./is-array-buffer');

// Test cases to verify that isArrayBuffer correctly identifies ArrayBuffers

// False cases
assert(!isArrayBuffer(function () {}));                  // Function is not an ArrayBuffer
assert(!isArrayBuffer(null));                            // Null is not an ArrayBuffer
assert(!isArrayBuffer(function* () { yield 42; return Infinity; })); // Generator function is not an ArrayBuffer
assert(!isArrayBuffer(Symbol('foo')));                   // Symbol is not an ArrayBuffer
assert(!isArrayBuffer(1n));                              // BigInt is not an ArrayBuffer
assert(!isArrayBuffer(Object(1n)));                      // BigInt object is not an ArrayBuffer

// False cases with collection and TypedArray-like objects
assert(!isArrayBuffer(new Set()));                       // Set object is not an ArrayBuffer
assert(!isArrayBuffer(new WeakSet()));                   // WeakSet object is not an ArrayBuffer
assert(!isArrayBuffer(new Map()));                       // Map object is not an ArrayBuffer
assert(!isArrayBuffer(new WeakMap()));                   // WeakMap object is not an ArrayBuffer
assert(!isArrayBuffer(new WeakRef({})));                 // WeakRef object is not an ArrayBuffer
assert(!isArrayBuffer(new FinalizationRegistry(() => {}))); // FinalizationRegistry is not an ArrayBuffer
assert(!isArrayBuffer(new SharedArrayBuffer()));         // SharedArrayBuffer is not an ArrayBuffer

// True cases
assert(isArrayBuffer(new ArrayBuffer()));                // ArrayBuffer instance should return true

// Check an instance of a custom class that extends ArrayBuffer
class MyArrayBuffer extends ArrayBuffer {}
assert(isArrayBuffer(new MyArrayBuffer()));              // Custom subclass instance of ArrayBuffer should return true

// package.json
{
  "name": "is-array-buffer",
  "version": "1.0.0",
  "description": "Determines if a value is a JavaScript ArrayBuffer",
  "main": "is-array-buffer.js",
  "scripts": {
    "test": "node test.js"
  },
  "keywords": [
    "ArrayBuffer",
    "type",
    "check"
  ],
  "author": "",
  "license": "ISC"
}
