// safe-buffer.js
'use strict';

const { Buffer } = require('buffer');

const useNative = typeof Buffer.alloc === 'function' && typeof Buffer.allocUnsafe === 'function';

function safeBuffer(size) {
  return useNative ? Buffer.alloc(size) : Buffer.alloc ? new Buffer(size).fill(0) : Buffer.from(new Uint8Array(size));
}

function safeBufferFrom(data, encoding) {
  if (useNative) {
    return Buffer.from(data, encoding);
  } else if (typeof data === 'string') {
    return Buffer.from ? Buffer.from(data, encoding) : new Buffer(data, encoding);
  } else {
    const buffer = new Buffer(data.length);
    data.forEach((item, index) => buffer[index] = item);
    return buffer;
  }
}

function safeBufferAllocUnsafe(size) {
  return useNative ? Buffer.allocUnsafe(size) : new Buffer(size);
}

function safeBufferAllocUnsafeSlow(size) {
  return useNative ? Buffer.allocUnsafeSlow(size) : new Buffer(size);
}

module.exports = {
  Buffer: {
    from: safeBufferFrom,
    alloc: safeBuffer,
    allocUnsafe: safeBufferAllocUnsafe,
    allocUnsafeSlow: safeBufferAllocUnsafeSlow
  }
};
