// index.js

// This function retrieves the ArrayBuffer from a given TypedArray.
// It checks if the input is a valid TypedArray and returns its buffer.
module.exports = function typedArrayBuffer(typedArray) {
  if (!typedArray || typeof typedArray !== 'object' || typeof typedArray.buffer === 'undefined') {
    throw new TypeError('Argument must be a TypedArray');
  }

  // Retrieve the buffer in a way compatible with older Node.js versions
  var buffer = typedArray.buffer || Object.getOwnPropertyDescriptor(typedArray, 'buffer').value;

  return buffer;
};

// test.js

const typedArrayBuffer = require('./index');
const assert = require('assert');

try {
  const arr = new Uint8Array(0); // Creates an empty Uint8Array
  assert.strictEqual(arr.buffer, typedArrayBuffer(arr)); // Asserts that the buffer returned is correct
  console.log('Test passed: Buffer is correctly retrieved.');
} catch (error) {
  console.error('Test failed:', error);
}

// package.json structure

{
  "name": "typed-array-buffer",
  "version": "1.0.0",
  "description": "Retrieve the ArrayBuffer from a TypedArray robustly.",
  "main": "index.js",
  "scripts": {
    "test": "node test.js" // Command to run the test file
  },
  "keywords": ["typedarray", "arraybuffer", "buffer", "nodejs", "compatibility"],
  "author": "Your Name",
  "license": "MIT"
}
