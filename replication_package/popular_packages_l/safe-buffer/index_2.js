// safe-buffer.js
'use strict';

const { Buffer } = require('buffer');

// Determine if native methods are available
const isNativeSupported = typeof Buffer.alloc === 'function' && typeof Buffer.allocUnsafe === 'function';

// Safe allocation of buffer with zero-fill if native methods are unavailable
function safeBuffer(size) {
  if (isNativeSupported) {
    return Buffer.alloc(size);
  } else {
    const buf = new Buffer(size);
    buf.fill(0);
    return buf;
  }
}

// Safe buffer creation from existing data
function safeBufferFrom(data, encoding) {
  if (isNativeSupported) {
    return Buffer.from(data, encoding);
  } else {
    if (typeof data === 'string') {
      return new Buffer(data, encoding);
    } else {
      const buf = new Buffer(data.length);
      for (let i = 0; i < data.length; i++) {
        buf[i] = data[i];
      }
      return buf;
    }
  }
}

// Safe allocation of uninitialized buffer
function safeBufferAllocUnsafe(size) {
  if (isNativeSupported) {
    return Buffer.allocUnsafe(size);
  } else {
    return new Buffer(size);
  }
}

// Safe allocation using the slower, non-pooled buffer allocation
function safeBufferAllocUnsafeSlow(size) {
  if (isNativeSupported) {
    return Buffer.allocUnsafeSlow(size);
  } else {
    return new Buffer(size);
  }
}

module.exports = {
  Buffer: {
    from: safeBufferFrom,
    alloc: safeBuffer,
    allocUnsafe: safeBufferAllocUnsafe,
    allocUnsafeSlow: safeBufferAllocUnsafeSlow
  }
};
