/* eslint-disable node/no-deprecated-api */

'use strict';

const { Buffer } = require('buffer');

const safer = {};

// Copy properties excluding 'SlowBuffer' and 'Buffer'
Object.keys(require('buffer')).forEach(key => {
  if (!['SlowBuffer', 'Buffer'].includes(key)) {
    safer[key] = require('buffer')[key];
  }
});

// Create a safe Buffer facade with restricted methods
const SaferBuffer = safer.Buffer = {};

// Copy Buffer methods excluding 'allocUnsafe' and 'allocUnsafeSlow'
Object.keys(Buffer).forEach(key => {
  if (!['allocUnsafe', 'allocUnsafeSlow'].includes(key)) {
    SaferBuffer[key] = Buffer[key];
  }
});

// Utilize Buffer's prototype
safer.Buffer.prototype = Buffer.prototype;

// Override 'from' method to add input validation
if (!SaferBuffer.from || SaferBuffer.from === Uint8Array.from) {
  SaferBuffer.from = function (value, encodingOrOffset, length) {
    if (typeof value === 'number') {
      throw new TypeError(`The "value" argument must not be of type number. Received type ${typeof value}`);
    }
    if (value && typeof value.length === 'undefined') {
      throw new TypeError(`The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type ${typeof value}`);
    }
    return Buffer(value, encodingOrOffset, length);
  };
}

// Override 'alloc' method for safer memory allocation
if (!SaferBuffer.alloc) {
  SaferBuffer.alloc = function (size, fill, encoding) {
    if (typeof size !== 'number') {
      throw new TypeError(`The "size" argument must be of type number. Received type ${typeof size}`);
    }
    if (size < 0 || size >= 2 * (1 << 30)) {
      throw new RangeError(`The value "${size}" is invalid for option "size"`);
    }
    const buf = Buffer(size);
    if (!fill || fill.length === 0) {
      buf.fill(0);
    } else if (typeof encoding === 'string') {
      buf.fill(fill, encoding);
    } else {
      buf.fill(fill);
    }
    return buf;
  };
}

// Add safer constants
if (!safer.constants) {
  safer.constants = { MAX_LENGTH: safer.kMaxLength };
  try {
    safer.constants.MAX_STRING_LENGTH = process.binding('buffer').kStringMaxLength;
  } catch (e) {
    // Ignore the error if binding isn't supported.
  }
}

module.exports = safer;
