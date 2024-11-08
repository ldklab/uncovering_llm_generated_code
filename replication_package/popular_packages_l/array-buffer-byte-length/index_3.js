// index.js

function getByteLength(input) {
    if (!(input instanceof ArrayBuffer)) {
        return NaN;
    }
    return input.byteLength;
}

module.exports = getByteLength;

// test.js

const assert = require('assert');
const getByteLength = require('./index');

try {
    assert.strictEqual(getByteLength([]), NaN, 'Input of array (not ArrayBuffer) should return NaN');
    assert.strictEqual(getByteLength(new ArrayBuffer(0)), 0, 'An ArrayBuffer with byteLength 0 should return 0');
    console.log('All validations succeeded');
} catch (err) {
    console.error('Validation failure:', err.message);
}

// package.json

{
  "name": "array-buffer-byte-length",
  "version": "1.0.1",
  "description": "Utility to obtain the byte length of an ArrayBuffer, including for environments without a .byteLength method.",
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
