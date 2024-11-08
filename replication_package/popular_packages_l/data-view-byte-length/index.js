// data-view-byte-length.js

'use strict';

function getDataViewByteLength(dataView) {
  // Attempt to get the byteLength from the prototype, if available
  if (typeof dataView.byteLength === 'number') {
    return dataView.byteLength;
  }

  // If byteLength is not accessible directly (older engines or deleted property),
  // use Object.getOwnPropertyDescriptor to read it directly from the object
  const descriptor = Object.getOwnPropertyDescriptor(dataView, 'byteLength');
  if (descriptor && typeof descriptor.value === 'number') {
    return descriptor.value;
  }

  // As a fallback, reconstruct byteLength from the ArrayBuffer and View properties
  if (dataView.buffer instanceof ArrayBuffer) {
    return dataView.byteOffset + dataView.byteLength;
  }

  throw new TypeError('Invalid DataView object');
}

module.exports = getDataViewByteLength;

// test.js
const dataViewByteLength = require('./data-view-byte-length');
const assert = require('assert');

// Test the module
const ab = new ArrayBuffer(42);
const dv = new DataView(ab);

assert.equal(dataViewByteLength(dv), 42);

console.log('All tests passed');
