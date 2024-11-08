// safe-buffer.js
'use strict';

const { Buffer } = require('buffer');

const useNative = typeof Buffer.alloc === 'function' && typeof Buffer.allocUnsafe === 'function';

function safeBuffer(size) {
  return useNative ? Buffer.alloc(size) : Buffer.alloc(size).fill(0);
}

function safeBufferFrom(data, encoding) {
  if (useNative) {
    return Buffer.from(data, encoding);
  } else if (typeof data === 'string') {
    return Buffer.alloc(data.length, data, encoding);
  } else {
    const buf = Buffer.alloc(data.length);
    for (let i = 0; i < data.length; i++) {
      buf[i] = data[i];
    }
    return buf;
  }
}

function safeBufferAllocUnsafe(size) {
  return useNative ? Buffer.allocUnsafe(size) : Buffer.alloc(size);
}

function safeBufferAllocUnsafeSlow(size) {
  return useNative ? Buffer.allocUnsafeSlow(size) : Buffer.alloc(size);
}

module.exports = {
  Buffer: {
    from: safeBufferFrom,
    alloc: safeBuffer,
    allocUnsafe: safeBufferAllocUnsafe,
    allocUnsafeSlow: safeBufferAllocUnsafeSlow
  }
};
