// is-array-buffer.js

'use strict';

function isArrayBuffer(value) {
  // Return false if the value is null or undefined; otherwise, check if the value is an instance of ArrayBuffer
  return value != null && Object.prototype.toString.call(value) === '[object ArrayBuffer]';
}

module.exports = isArrayBuffer;

// test.js

const assert = require('assert');
const isArrayBuffer = require('./is-array-buffer');

// Test cases demonstrating usage of isArrayBuffer to ensure correctness with different data types
assert.strictEqual(isArrayBuffer(function () {}), false);  // Functions are not ArrayBuffers
assert.strictEqual(isArrayBuffer(null), false);           // null is not an ArrayBuffer
assert.strictEqual(isArrayBuffer(function* () { yield 42; return Infinity; }), false);  // Generators are not ArrayBuffers
assert.strictEqual(isArrayBuffer(Symbol('foo')), false);  // Symbols are not ArrayBuffers
assert.strictEqual(isArrayBuffer(1n), false);             // BigInts are not ArrayBuffers
assert.strictEqual(isArrayBuffer(Object(1n)), false);     // Boxed BigInts are not ArrayBuffers

assert.strictEqual(isArrayBuffer(new Set()), false);      // Sets are not ArrayBuffers
assert.strictEqual(isArrayBuffer(new WeakSet()), false);  // WeakSets are not ArrayBuffers
assert.strictEqual(isArrayBuffer(new Map()), false);      // Maps are not ArrayBuffers
assert.strictEqual(isArrayBuffer(new WeakMap()), false);  // WeakMaps are not ArrayBuffers
assert.strictEqual(isArrayBuffer(new WeakRef({})), false); // WeakRefs are not ArrayBuffers
assert.strictEqual(isArrayBuffer(new FinalizationRegistry(() => {})), false); // FinalizationRegistrys are not ArrayBuffers
assert.strictEqual(isArrayBuffer(new SharedArrayBuffer()), false); // SharedArrayBuffers are not ArrayBuffers

assert.strictEqual(isArrayBuffer(new ArrayBuffer()), true); // ArrayBuffers should return true

class MyArrayBuffer extends ArrayBuffer {}
assert.strictEqual(isArrayBuffer(new MyArrayBuffer()), true); // Custom extensions of ArrayBuffer should also return true

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
