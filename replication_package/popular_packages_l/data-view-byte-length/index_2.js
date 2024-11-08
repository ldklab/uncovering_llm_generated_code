// data-view-byte-length.js

'use strict';

function getDataViewByteLength(dataView) {
  if (typeof dataView.byteLength === 'number') {
    return dataView.byteLength;
  }

  const descriptor = Object.getOwnPropertyDescriptor(dataView, 'byteLength');
  if (descriptor && typeof descriptor.value === 'number') {
    return descriptor.value;
  }

  if (dataView.buffer instanceof ArrayBuffer) {
    return dataView.byteOffset + dataView.byteLength;
  }

  throw new TypeError('Invalid DataView object');
}

module.exports = getDataViewByteLength;

// test.js
const dataViewByteLength = require('./data-view-byte-length');
const assert = require('assert');

const ab = new ArrayBuffer(42);
const dv = new DataView(ab);

assert.equal(dataViewByteLength(dv), 42);

console.log('All tests passed');
