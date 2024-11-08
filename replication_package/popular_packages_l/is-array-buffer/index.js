// is-array-buffer.js

'use strict';

function isArrayBuffer(value) {
  // Check for null or undefined
  if (value == null) {
    return false;
  }

  // Check the type using Object.prototype.toString
  return Object.prototype.toString.call(value) === '[object ArrayBuffer]';
}

module.exports = isArrayBuffer;

// test.js

var assert = require('assert');
var isArrayBuffer = require('./is-array-buffer');

// Test cases
assert(!isArrayBuffer(function () {}));
assert(!isArrayBuffer(null));
assert(!isArrayBuffer(function* () { yield 42; return Infinity; }));
assert(!isArrayBuffer(Symbol('foo')));
assert(!isArrayBuffer(1n));
assert(!isArrayBuffer(Object(1n)));

assert(!isArrayBuffer(new Set()));
assert(!isArrayBuffer(new WeakSet()));
assert(!isArrayBuffer(new Map()));
assert(!isArrayBuffer(new WeakMap()));
assert(!isArrayBuffer(new WeakRef({})));
assert(!isArrayBuffer(new FinalizationRegistry(() => {})));
assert(!isArrayBuffer(new SharedArrayBuffer()));

assert(isArrayBuffer(new ArrayBuffer()));

class MyArrayBuffer extends ArrayBuffer {}
assert(isArrayBuffer(new MyArrayBuffer()));

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
