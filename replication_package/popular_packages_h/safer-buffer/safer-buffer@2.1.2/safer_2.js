'use strict';

const { Buffer: OriginalBuffer, ...bufferExports } = require('buffer');

const safer = { ...bufferExports };
const SaferBuffer = safer.Buffer = {};

Object.keys(OriginalBuffer).forEach(key => {
  if (!['allocUnsafe', 'allocUnsafeSlow'].includes(key)) {
    SaferBuffer[key] = OriginalBuffer[key];
  }
});

safer.Buffer.prototype = OriginalBuffer.prototype;

if (!SaferBuffer.from || SaferBuffer.from === Uint8Array.from) {
  SaferBuffer.from = function from(value, encodingOrOffset, length) {
    if (typeof value === 'number') {
      throw new TypeError(`The "value" argument must not be of type number. Received type ${typeof value}`);
    }
    if (value && typeof value.length === 'undefined') {
      throw new TypeError(`The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type ${typeof value}`);
    }
    return OriginalBuffer.from(value, encodingOrOffset, length);
  };
}

if (!SaferBuffer.alloc) {
  SaferBuffer.alloc = function alloc(size, fill, encoding) {
    if (typeof size !== 'number') {
      throw new TypeError(`The "size" argument must be of type number. Received type ${typeof size}`);
    }
    if (size < 0 || size >= 2 * (1 << 30)) {
      throw new RangeError(`The value "${size}" is invalid for option "size"`);
    }
    const buf = OriginalBuffer.alloc(size);
    if (fill === undefined || fill.length === 0) {
      buf.fill(0);
    } else if (typeof encoding === 'string') {
      buf.fill(fill, encoding);
    } else {
      buf.fill(fill);
    }
    return buf;
  };
}

try {
  safer.kStringMaxLength = process.binding('buffer').kStringMaxLength;
} catch (e) {}

safer.constants = {
  MAX_LENGTH: safer.kMaxLength,
  MAX_STRING_LENGTH: safer.kStringMaxLength
};

module.exports = safer;
