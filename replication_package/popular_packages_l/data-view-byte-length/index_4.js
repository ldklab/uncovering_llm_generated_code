// data-view-byte-length.js

'use strict';

function getDataViewByteLength(dataView) {
  // Try to retrieve the byteLength property directly if it exists
  if (typeof dataView.byteLength === 'number') {
    return dataView.byteLength;
  }

  // If direct access fails, use Object.getOwnPropertyDescriptor to access the byteLength
  const descriptor = Object.getOwnPropertyDescriptor(dataView, 'byteLength');
  if (descriptor && typeof descriptor.value === 'number') {
    return descriptor.value;
  }

  // Use a fallback approach by calculating byteLength manually using buffer and offset
  if (dataView.buffer instanceof ArrayBuffer) {
    return dataView.byteOffset + dataView.byteLength;
  }

  // Throw an error if it is not a valid DataView object
  throw new TypeError('Invalid DataView object');
}

module.exports = getDataViewByteLength;

// test.js
const getDataViewByteLength = require('./data-view-byte-length');
const assert = require('assert');

// Test the function with a DataView
const arrayBuffer = new ArrayBuffer(42);
const dataView = new DataView(arrayBuffer);

// Ensure the function returns correct byte length
assert.equal(getDataViewByteLength(dataView), 42);

// Confirm test completion
console.log('All tests passed');
