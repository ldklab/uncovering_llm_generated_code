// data-view-byte-length.js

'use strict';

function getDataViewByteLength(dataView) {
  // Try accessing byteLength directly from the DataView instance
  if (typeof dataView.byteLength === 'number') {
    return dataView.byteLength;
  }

  // Use Object.getOwnPropertyDescriptor for direct property access if byteLength is not directly available
  const descriptor = Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength');
  if (descriptor && typeof descriptor.get === 'function') {
    return descriptor.get.call(dataView);
  }

  // Fallback: Calculate byteLength using buffer properties
  if (dataView.buffer instanceof ArrayBuffer) {
    return dataView.byteOffset + dataView.byteLength;
  }

  throw new TypeError('Invalid DataView object');
}

module.exports = getDataViewByteLength;

// test.js
const getDataViewByteLength = require('./data-view-byte-length');
const assert = require('assert');

// Test the function with a valid DataView
const arrayBuffer = new ArrayBuffer(42);
const dataView = new DataView(arrayBuffer);

assert.strictEqual(getDataViewByteLength(dataView), 42);

console.log('All tests passed');
