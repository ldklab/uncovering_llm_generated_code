// safe-buffer.js
'use strict';

var buffer = require('buffer');
var Buffer = buffer.Buffer;

// Determine if the native Buffer methods (alloc, allocUnsafe, from, allocUnsafeSlow) are available
var useNative = typeof Buffer.alloc === 'function' && typeof Buffer.from === 'function';

// Function to safely allocate a buffer of specified size with zero-fill
function safeBuffer(size) {
  if (useNative) {
    return Buffer.alloc(size);
  } else {
    var buf = new Buffer(size);
    buf.fill(0);
    return buf;
  }
}

// Function to safely create a buffer from existing data and encoding
function safeBufferFrom(data, encoding) {
  if (useNative) {
    return Buffer.from(data, encoding);
  } else {
    if (typeof data === 'string') {
      return new Buffer(data, encoding);
    } else {
      var buf = new Buffer(data.length);
      for (var i = 0; i < data.length; i++) {
        buf[i] = data[i];
      }
      return buf;
    }
  }
}

// Function to safely allocate an uninitialized buffer of specified size
function safeBufferAllocUnsafe(size) {
  if (useNative) {
    return Buffer.allocUnsafe(size);
  } else {
    return new Buffer(size);
  }
}

// Function to safely allocate an uninitialized slow buffer of specified size
function safeBufferAllocUnsafeSlow(size) {
  if (useNative) {
    return Buffer.allocUnsafeSlow(size);
  } else {
    return new Buffer(size);
  }
}

// Export functions to emulate Buffer.alloc, Buffer.from, Buffer.allocUnsafe, Buffer.allocUnsafeSlow
module.exports = {
  Buffer: {
    from: safeBufferFrom,
    alloc: safeBuffer,
    allocUnsafe: safeBufferAllocUnsafe,
    allocUnsafeSlow: safeBufferAllocUnsafeSlow
  }
};
