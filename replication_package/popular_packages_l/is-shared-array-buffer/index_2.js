// is-shared-array-buffer.js
'use strict';

function isSharedArrayBuffer(value) {
  return value instanceof SharedArrayBuffer;
}

module.exports = isSharedArrayBuffer;

// test-is-shared-array-buffer.js
'use strict';

const assert = require('assert');
const isSharedArrayBuffer = require('./is-shared-array-buffer');

assert.strictEqual(isSharedArrayBuffer(function () {}), false);
assert.strictEqual(isSharedArrayBuffer(null), false);
assert.strictEqual(isSharedArrayBuffer(function* () { yield 42; return Infinity; }), false);
assert.strictEqual(isSharedArrayBuffer(Symbol('foo')), false);
assert.strictEqual(isSharedArrayBuffer(1n), false);
assert.strictEqual(isSharedArrayBuffer(Object(1n)), false);

assert.strictEqual(isSharedArrayBuffer(new Set()), false);
assert.strictEqual(isSharedArrayBuffer(new WeakSet()), false);
assert.strictEqual(isSharedArrayBuffer(new Map()), false);
assert.strictEqual(isSharedArrayBuffer(new WeakMap()), false);
assert.strictEqual(isSharedArrayBuffer(new WeakRef({})), false);
assert.strictEqual(isSharedArrayBuffer(new FinalizationRegistry(() => {})), false);
assert.strictEqual(isSharedArrayBuffer(new ArrayBuffer()), false);

assert.strictEqual(isSharedArrayBuffer(new SharedArrayBuffer()), true);

class MySharedArrayBuffer extends SharedArrayBuffer {}
assert.strictEqual(isSharedArrayBuffer(new MySharedArrayBuffer()), true);

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
