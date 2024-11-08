/* eslint-disable node/no-deprecated-api */

'use strict'

const { Buffer: OriginalBuffer, ...buffer } = require('buffer');

const safer = {};
const Safer = {};

// Copy properties from buffer, excluding specific ones
for (const key in buffer) {
  if (buffer.hasOwnProperty(key) && key !== 'SlowBuffer' && key !== 'Buffer') {
    safer[key] = buffer[key];
  }
}

// Copy properties from OriginalBuffer, excluding specific methods
for (const key in OriginalBuffer) {
  if (OriginalBuffer.hasOwnProperty(key) && key !== 'allocUnsafe' && key !== 'allocUnsafeSlow') {
    Safer[key] = OriginalBuffer[key];
  }
}

// Attach Buffer prototype
Safer.prototype = OriginalBuffer.prototype;
safer.Buffer = Safer;

// Custom Safer.from implementation
if (!Safer.from || Safer.from === Uint8Array.from) {
  Safer.from = function (value, encodingOrOffset, length) {
    if (typeof value === 'number') {
      throw new TypeError(`The "value" argument must not be of type number. Received type ${typeof value}`);
    }
    if (value && typeof value.length === 'undefined') {
      throw new TypeError(`The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type ${typeof value}`);
    }
    return OriginalBuffer(value, encodingOrOffset, length);
  }
}

// Custom Safer.alloc implementation
if (!Safer.alloc) {
  Safer.alloc = function (size, fill, encoding) {
    if (typeof size !== 'number') {
      throw new TypeError(`The "size" argument must be of type number. Received type ${typeof size}`);
    }
    if (size < 0 || size >= 2 * (1 << 30)) {
      throw new RangeError(`The value "${size}" is invalid for option "size"`);
    }
    const buf = OriginalBuffer(size);
    if (!fill || fill.length === 0) {
      buf.fill(0);
    } else if (typeof encoding === 'string') {
      buf.fill(fill, encoding);
    } else {
      buf.fill(fill);
    }
    return buf;
  }
}

// Constants and metadata initialization
try {
  safer.kStringMaxLength = process.binding('buffer').kStringMaxLength;
} catch (e) {
  // Handle environments without process.binding
}

safer.constants = {
  MAX_LENGTH: safer.kMaxLength
};

if (safer.kStringMaxLength) {
  safer.constants.MAX_STRING_LENGTH = safer.kStringMaxLength;
}

module.exports = safer;
