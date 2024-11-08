/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
var buffer = require('buffer');
var Buffer = buffer.Buffer;

/**
 * Helper function to copy properties from source object to destination object.
 * 
 * @param {Object} src - The source object
 * @param {Object} dst - The destination object
 */
function copyProps(src, dst) {
  for (var key in src) {
    dst[key] = src[key];
  }
}

// Export buffer directly if it supports modern buffer methods.
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer;
} else {
  // Copy properties of `require('buffer')` to exports, and define `SafeBuffer`.
  copyProps(buffer, exports);
  exports.Buffer = SafeBuffer;
}

/**
 * SafeBuffer constructor function acts as a wrapper around Buffer.
 * 
 * @param {any} arg - Argument for buffer initialization
 * @param {string|number} [encodingOrOffset] - Encoding or offset
 * @param {number} [length] - Length of buffer
 * @returns {Buffer} - New Buffer instance
 */
function SafeBuffer(arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length);
}

SafeBuffer.prototype = Object.create(Buffer.prototype);

// Copy static methods from Buffer to SafeBuffer
copyProps(Buffer, SafeBuffer);

/**
 * Static from method for creating buffer, with argument checking.
 * 
 * @param {any} arg - Argument for buffer initialization
 * @param {string|number} [encodingOrOffset] - Encoding or offset
 * @param {number} [length] - Length of buffer
 * @returns {Buffer} - New Buffer instance
 */
SafeBuffer.from = function(arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number');
  }
  return Buffer(arg, encodingOrOffset, length);
};

/**
 * Static alloc method for allocating a zeroed buffer.
 * 
 * @param {number} size - Size of the buffer
 * @param {string|Buffer} [fill] - Value to fill
 * @param {string} [encoding] - Encoding of fill value
 * @returns {Buffer} - New Buffer instance
 */
SafeBuffer.alloc = function(size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number');
  }
  var buf = Buffer(size);
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

/**
 * Static allocUnsafe method for allocating an uninitialized buffer.
 * 
 * @param {number} size - Size of the buffer
 * @returns {Buffer} - New (possibly uninitialized) Buffer instance
 */
SafeBuffer.allocUnsafe = function(size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number');
  }
  return Buffer(size);
};

/**
 * Static allocUnsafeSlow method for allocating a slow buffer.
 * 
 * @param {number} size - Size of the buffer
 * @returns {Buffer} - New SlowBuffer instance
 */
SafeBuffer.allocUnsafeSlow = function(size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number');
  }
  return buffer.SlowBuffer(size);
};
