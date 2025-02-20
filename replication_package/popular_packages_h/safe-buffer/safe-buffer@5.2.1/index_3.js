/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */

const buffer = require('buffer');
const Buffer = buffer.Buffer;

// Alternative to using Object.keys for older JavaScript engines
function copyProps(source, destination) {
  for (let key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      destination[key] = source[key];
    }
  }
}

if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  // If modern Buffer methods are available, export the built-in buffer module
  module.exports = buffer;
} else {
  // Use SafeBuffer as a fallback for environments without modern Buffer methods

  // Copy properties from the native buffer module to exports
  copyProps(buffer, exports);
  exports.Buffer = SafeBuffer; // Set SafeBuffer as the Buffer export
}

function SafeBuffer(arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length);
}

SafeBuffer.prototype = Object.create(Buffer.prototype);

// Copy static methods from Buffer to SafeBuffer
copyProps(Buffer, SafeBuffer);

// Define SafeBuffer.from to mimic Buffer.from with added type checking
SafeBuffer.from = function(arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number');
  }
  return Buffer(arg, encodingOrOffset, length);
};

// Define SafeBuffer.alloc to mimic Buffer.alloc with added type checking and zero fill
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

// Define SafeBuffer.allocUnsafe to mimic Buffer.allocUnsafe with added type checking
SafeBuffer.allocUnsafe = function(size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number');
  }
  return Buffer(size);
};

// Define SafeBuffer.allocUnsafeSlow to mimic Buffer.allocUnsafeSlow with added type checking
SafeBuffer.allocUnsafeSlow = function(size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number');
  }
  return buffer.SlowBuffer(size);
}
