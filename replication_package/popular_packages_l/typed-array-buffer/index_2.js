// The Node.js code defines a small package to retrieve the ArrayBuffer from a TypedArray in a robust way.

// Filename: index.js

// This module exports a function that takes a TypedArray as input. If the input is not a TypedArray,
// it throws a TypeError. The function retrieves and returns the ArrayBuffer associated with the TypedArray.
// It does this by checking if the `buffer` property is directly accessible. If not, it attempts to use
// `Object.getOwnPropertyDescriptor` as a fallback for older Node.js versions where `buffer` is non-configurable.

module.exports = function typedArrayBuffer(typedArray) {
  if (!typedArray || typeof typedArray !== 'object' || typeof typedArray.buffer === 'undefined') {
    throw new TypeError('Argument must be a TypedArray');
  }

  // Retrieve the buffer property from the TypedArray
  const buffer = typedArray.buffer || Object.getOwnPropertyDescriptor(typedArray, 'buffer').value;

  return buffer;
};

// Filename: test.js

// This is a basic test script for the typedArrayBuffer implementation using assert.
// It ensures that the function correctly retrieves the ArrayBuffer from a TypedArray instance.

const typedArrayBuffer = require('./index');
const assert = require('assert');

try {
  const arr = new Uint8Array(0);
  assert.strictEqual(arr.buffer, typedArrayBuffer(arr));
  console.log('Test passed: Buffer is correctly retrieved.');
} catch (error) {
  console.error('Test failed:', error);
}

// To run tests, execute the following command in your terminal within the project directory:
// node test.js

// package.json setup

// The package.json provides metadata for the `typed-array-buffer` package,
// including its name, version, description, and script for running tests.

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
