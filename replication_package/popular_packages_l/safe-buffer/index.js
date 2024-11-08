// safe-buffer.js
'use strict';

var buffer = require('buffer');
var Buffer = buffer.Buffer;

// Check if native Buffer.from, Buffer.alloc, Buffer.allocUnsafe, Buffer.allocUnsafeSlow are available
var useNative = typeof Buffer.alloc === 'function' && typeof Buffer.allocUnsafe === 'function';

function safeBuffer(size) {
  if (useNative) {
    return Buffer.alloc(size);
  } else {
    var buf = new Buffer(size);
    buf.fill(0);
    return buf;
  }
}

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

function safeBufferAllocUnsafe(size) {
  if (useNative) {
    return Buffer.allocUnsafe(size);
  } else {
    return new Buffer(size);
  }
}

function safeBufferAllocUnsafeSlow(size) {
  if (useNative) {
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
