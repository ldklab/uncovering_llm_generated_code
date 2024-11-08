'use strict';

const buffer = require('buffer');
const Buffer = buffer.Buffer;

const safer = {};

for (const key in buffer) {
  if (!buffer.hasOwnProperty(key)) continue;
  if (key === 'SlowBuffer' || key === 'Buffer') continue;
  safer[key] = buffer[key];
}

const Safer = safer.Buffer = {};
for (const key in Buffer) {
  if (!Buffer.hasOwnProperty(key)) continue;
  if (key === 'allocUnsafe' || key === 'allocUnsafeSlow') continue;
  Safer[key] = Buffer[key];
}

safer.Buffer.prototype = Buffer.prototype;

if (!Safer.from || Safer.from === Uint8Array.from) {
  Safer.from = (value, encodingOrOffset, length) => {
    if (typeof value === 'number') {
      throw new TypeError(`The "value" argument must not be of type number. Received type ${typeof value}`);
    }
    if (value && typeof value.length === 'undefined') {
      throw new TypeError(`The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type ${typeof value}`);
    }
    return Buffer(value, encodingOrOffset, length);
  };
}

if (!Safer.alloc) {
  Safer.alloc = (size, fill, encoding) => {
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

if (!safer.kStringMaxLength) {
  try {
    safer.kStringMaxLength = process.binding('buffer').kStringMaxLength;
  } catch (e) {
    // Ignored if unsupported
  }
}

if (!safer.constants) {
  safer.constants = {
    MAX_LENGTH: safer.kMaxLength
  };
  if (safer.kStringMaxLength) {
    safer.constants.MAX_STRING_LENGTH = safer.kStringMaxLength;
  }
}

module.exports = safer;
