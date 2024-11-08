// data-view-byte-length.js

'use strict';

function getDataViewByteLength(dataView) {
  // Check if byteLength is directly available as a number on the dataView
  if (typeof dataView.byteLength === 'number') {
    return dataView.byteLength; // Return directly if accessible
  }

  // Use descriptor to get byteLength if property was deleted or not directly accessible
  const descriptor = Object.getOwnPropertyDescriptor(dataView, 'byteLength');
  if (descriptor && typeof descriptor.value === 'number') {
    return descriptor.value; // Return the value from descriptor if found
  }

  // Fallback: reconstruct byteLength from buffer, byteOffset and byteLength properties
  if (dataView.buffer instanceof ArrayBuffer) {
    return dataView.byteOffset + dataView.byteLength; // Calculate total view length
  }

  // Throw error if none of the above methods succeed, indicating invalid DataView
  throw new TypeError('Invalid DataView object');
}

module.exports = getDataViewByteLength;

// test.js
const getDataViewByteLength = require('./data-view-byte-length');
const assert = require('assert');

// Creating ArrayBuffer and DataView for testing
const ab = new ArrayBuffer(42);
const dv = new DataView(ab);

// Test the function to ensure it returns the correct length
assert.equal(getDataViewByteLength(dv), 42);

console.log('All tests passed');
