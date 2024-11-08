// index.js

function byteLength(buffer) {
    if (!(buffer instanceof ArrayBuffer)) {
        return NaN;
    }
    return buffer.byteLength;
}

module.exports = byteLength;

// test.js

const assert = require('assert');
const byteLength = require('./index');

try {
    assert.strictEqual(Number.isNaN(byteLength([])), true, 'an array is not an ArrayBuffer, yields NaN');
    assert.strictEqual(byteLength(new ArrayBuffer(0)), 0, 'ArrayBuffer of byteLength 0, yields 0');
    console.log('All tests passed');
} catch (error) {
    console.error('A test failed:', error.message);
}

// package.json

{
  "name": "array-buffer-byte-length",
  "version": "1.0.0",
  "description": "Get the byte length of an ArrayBuffer, even in engines without a .byteLength method.",
  "main": "index.js",
  "scripts": {
    "test": "node test.js"
  },
  "keywords": [
    "ArrayBuffer",
    "byteLength"
  ],
  "author": "",
  "license": "MIT"
}
