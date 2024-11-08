markdown
// is-shared-array-buffer.js
'use strict';

function isSharedArrayBuffer(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return Object.prototype.toString.call(value) === '[object SharedArrayBuffer]';
}

module.exports = isSharedArrayBuffer;

// test-is-shared-array-buffer.js
'use strict';

const assert = require('assert');
const isSharedArrayBuffer = require('./is-shared-array-buffer');

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

assert(isSharedArrayBuffer(new SharedArrayBuffer()));

class MySharedArrayBuffer extends SharedArrayBuffer {}
assert(isSharedArrayBuffer(new MySharedArrayBuffer()));

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
