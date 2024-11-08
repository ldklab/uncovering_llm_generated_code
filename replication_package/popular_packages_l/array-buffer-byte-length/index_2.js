// index.js

/**
 * Calculates the byte length of an ArrayBuffer.
 * 
 * @param {ArrayBuffer} buffer - The buffer to calculate the byte length for.
 * @returns {number} - The byte length of the buffer or NaN if the input is not an ArrayBuffer.
 */
function byteLength(buffer) {
    // Check if the input is an instance of ArrayBuffer
    if (!(buffer instanceof ArrayBuffer)) {
        // Return NaN for invalid input
        return NaN;
    }
    // Return the byteLength property of the ArrayBuffer
    return buffer.byteLength;
}

// Export the byteLength function for use in other files
module.exports = byteLength;

// test.js

const assert = require('assert');
const byteLength = require('./index');

try {
    // Test: Passing an array, not an ArrayBuffer, should return NaN
    assert.strictEqual(byteLength([]), NaN, 'An array is not an ArrayBuffer, yields NaN');

    // Test: Passing an ArrayBuffer with length 0 should return 0
    assert.strictEqual(byteLength(new ArrayBuffer(0)), 0, 'ArrayBuffer of byteLength 0, yields 0');

    // Log success message if all tests pass
    console.log('All tests passed');
} catch (error) {
    // Log error message if any test fails
    console.error('A test failed:', error.message);
}

// package.json

{
  "name": "array-buffer-byte-length",
  "version": "1.0.0",
  "description": "Calculate the byte length of an ArrayBuffer.",
  "main": "index.js",
  "scripts": {
    "test": "node test.js"
  },
  "keywords": [
    "ArrayBuffer",
    "byteLength",
    "utility"
  ],
  "author": "Your Name",
  "license": "MIT"
}
