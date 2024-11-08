// Filename: index.js

module.exports = function getTypedArrayBuffer(typedArray) {
  if (!typedArray || typeof typedArray !== 'object' || typeof typedArray.buffer === 'undefined') {
    throw new TypeError('Argument must be a TypedArray');
  }

  let buffer = typedArray.buffer || Object.getOwnPropertyDescriptor(typedArray, 'buffer').value;

  return buffer;
};

// Filename: test.js

const getTypedArrayBuffer = require('./index');
const assert = require('assert');

try {
  const array = new Uint8Array(0);
  assert.strictEqual(array.buffer, getTypedArrayBuffer(array));
  console.log('Test passed: Buffer is correctly retrieved.');
} catch (error) {
  console.error('Test failed:', error);
}

// To run tests
// Execute this command in the terminal after moving to the directory containing these files:
// node test.js

// package.json setup

{
  "name": "typed-array-buffer",
  "version": "1.0.0",
  "description": "Retrieve the ArrayBuffer from a TypedArray robustly.",
  "main": "index.js",
  "scripts": {
    "test": "node test.js"
  },
  "keywords": ["typedarray", "arraybuffer", "buffer", "nodejs", "compatibility"],
  "author": "Your Name",
  "license": "MIT"
}
