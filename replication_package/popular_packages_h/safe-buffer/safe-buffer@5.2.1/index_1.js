/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
const { Buffer, SlowBuffer, kMaxLength } = require('buffer');

// Helper function to copy properties from source to destination object
function copyProps(src, dst) {
  for (const key in src) {
    if (Object.prototype.hasOwnProperty.call(src, key)) {
      dst[key] = src[key];
    }
  }
}

if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = { Buffer, SlowBuffer, kMaxLength };
} else {
  // Extend exports with the properties of the required buffer module
  copyProps({ Buffer, SlowBuffer, kMaxLength }, exports);
  exports.Buffer = SafeBuffer;
}

// SafeBuffer function to mimic the Buffer function
function SafeBuffer(arg, encodingOrOffset, length) {
  return new Buffer(arg, encodingOrOffset, length);
}

SafeBuffer.prototype = Object.create(Buffer.prototype);

// Extend SafeBuffer with Buffer static methods
copyProps(Buffer, SafeBuffer);

SafeBuffer.from = function(arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number');
  }
  return new Buffer(arg, encodingOrOffset, length);
};

SafeBuffer.alloc = function(size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number');
  }
  const buf = Buffer(size);
  if (fill !== undefined) {
    buf.fill(fill, encoding);
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

SafeBuffer.allocUnsafeSlow = function(size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number');
  }
  return SlowBuffer(size);
};
