/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
const { Buffer, SlowBuffer } = require('buffer');

// Utility function to copy properties from one object to another
function copyProps(src, dst) {
  for (const key in src) {
    dst[key] = src[key];
  }
}

// Check if the modern Buffer methods exist
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = require('buffer');
} else {
  // If not, fill the exports with the required methods
  copyProps(require('buffer'), exports);
  exports.Buffer = SafeBuffer;
}

// SafeBuffer constructor that mimics Buffer constructor
function SafeBuffer(arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length);
}

// Inherit prototype for SafeBuffer from Buffer
SafeBuffer.prototype = Object.create(Buffer.prototype);

// Copy static methods from Buffer to SafeBuffer
copyProps(Buffer, SafeBuffer);

// Static method to create a buffer from a source
SafeBuffer.from = function(arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number');
  }
  return Buffer(arg, encodingOrOffset, length);
};

// Static methods to allocate a buffer of a specified size
SafeBuffer.alloc = function(size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number');
  }
  const buf = Buffer(size);
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding);
    } else {
      buf.fill(fill);
    }
  } else {
    buf.fill(0);
  }
  return buf;
};

SafeBuffer.allocUnsafe = function(size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number');
  }
  return Buffer(size);
};

// Static method to allocate an uninitialized buffer with the "slow" method
SafeBuffer.allocUnsafeSlow = function(size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number');
  }
  return SlowBuffer(size);
};
