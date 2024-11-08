// is-array-buffer.js

'use strict';

/**
 * Determines if a given value is an ArrayBuffer.
 * First checks if the value is null or undefined, returning false if so.
 * Then checks the value's type using the toString method from Object.prototype,
 * specifically looking if it matches '[object ArrayBuffer]'.
 * 
 * @param {any} value - The value to check
 * @returns {boolean} - Returns true if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(value) {
  if (value == null) {
    return false;
  }
  return Object.prototype.toString.call(value) === '[object ArrayBuffer]';
}

module.exports = isArrayBuffer;

// test.js

const assert = require('assert');
const isArrayBuffer = require('./is-array-buffer');

// Test cases for the isArrayBuffer function

// These should assert false as they are not ArrayBuffers
assert(!isArrayBuffer(function () {})); // Function
assert(!isArrayBuffer(null)); // Null value
assert(!isArrayBuffer(function* () { yield 42; return Infinity; })); // Generator function
assert(!isArrayBuffer(Symbol('foo'))); // Symbol
assert(!isArrayBuffer(1n)); // BigInt
assert(!isArrayBuffer(Object(1n))); // Wrapped BigInt as an object

// These should assert false as they are not ArrayBuffers
assert(!isArrayBuffer(new Set())); // Set
assert(!isArrayBuffer(new WeakSet())); // WeakSet
assert(!isArrayBuffer(new Map())); // Map
assert(!isArrayBuffer(new WeakMap())); // WeakMap
assert(!isArrayBuffer(new WeakRef({}))); // WeakRef
assert(!isArrayBuffer(new FinalizationRegistry(() => {}))); // FinalizationRegistry
assert(!isArrayBuffer(new SharedArrayBuffer())); // SharedArrayBuffer

// These should assert true as they are ArrayBuffers
assert(isArrayBuffer(new ArrayBuffer())); // ArrayBuffer

class MyArrayBuffer extends ArrayBuffer {}
assert(isArrayBuffer(new MyArrayBuffer())); // Extended ArrayBuffer

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
