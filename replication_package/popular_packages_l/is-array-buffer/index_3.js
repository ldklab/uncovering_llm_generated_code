// is-array-buffer.js

'use strict';

// Function to determine if the input value is an ArrayBuffer
function isArrayBuffer(value) {
  // Returns false if the value is null or undefined
  if (value == null) {
    return false;
  }
  
  // Uses Object.prototype.toString to check if the value is an instance of ArrayBuffer
  return Object.prototype.toString.call(value) === '[object ArrayBuffer]';
}

// Export the function to be used in other files
module.exports = isArrayBuffer;

// test.js

var assert = require('assert'); // Import the assert module for testing
var isArrayBuffer = require('./is-array-buffer'); // Import the isArrayBuffer function

// Test cases to validate the isArrayBuffer function

// Test with various data types and structures that are not ArrayBuffer
assert(!isArrayBuffer(function () {})); // Function
assert(!isArrayBuffer(null)); // Null
assert(!isArrayBuffer(function* () { yield 42; return Infinity; })); // Generator function
assert(!isArrayBuffer(Symbol('foo'))); // Symbol
assert(!isArrayBuffer(1n)); // BigInt
assert(!isArrayBuffer(Object(1n))); // BigInt object
assert(!isArrayBuffer(new Set())); // Set
assert(!isArrayBuffer(new WeakSet())); // WeakSet
assert(!isArrayBuffer(new Map())); // Map
assert(!isArrayBuffer(new WeakMap())); // WeakMap
assert(!isArrayBuffer(new WeakRef({}))); // WeakRef
assert(!isArrayBuffer(new FinalizationRegistry(() => {}))); // FinalizationRegistry
assert(!isArrayBuffer(new SharedArrayBuffer())); // SharedArrayBuffer which is a different type

// Test with an ArrayBuffer instance
assert(isArrayBuffer(new ArrayBuffer()));

// Test with a class that extends ArrayBuffer
class MyArrayBuffer extends ArrayBuffer {}
assert(isArrayBuffer(new MyArrayBuffer()));

// package.json

{
  "name": "is-array-buffer",
  "version": "1.0.0",
  "description": "Determines if a value is a JavaScript ArrayBuffer",
  "main": "is-array-buffer.js",
  "scripts": {
    "test": "node test.js" // Script to run the test file
  },
  "keywords": [
    "ArrayBuffer", 
    "type", 
    "check"
  ],
  "author": "", // Placeholder for author information
  "license": "ISC" // License type
}
