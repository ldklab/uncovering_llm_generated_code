// buffer.js - A simplified implementation of Node.js Buffer for browsers using Typed Arrays

class Buffer extends Uint8Array {
  constructor(arg, encodingOrOffset, length) {
    if (typeof arg === 'number') {
      super(arg);
    } else if (typeof arg === 'string') {
      super(Buffer._fromString(arg, encodingOrOffset));
    } else if (arg instanceof ArrayBuffer) {
      super(arg, encodingOrOffset, length);
    } else {
      super(arg.length);
      this.set(arg);
    }
  }

  static _fromString(string, encoding = 'utf8') {
    if (encoding !== 'utf8') {
      throw new Error('Unsupported encoding: only utf8 is implemented');
    }
    return new TextEncoder().encode(string);
  }

  static from(arg, encodingOrOffset, length) {
    return new Buffer(arg, encodingOrOffset, length);
  }

  toString(encoding = 'utf8') {
    if (encoding !== 'utf8') {
      throw new Error('Only utf8 encoding is supported for toString');
    }
    return new TextDecoder().decode(this);
  }

  slice(start, end) {
    return new Buffer(super.slice(start, end));
  }

  static concat(buffers, totalLength) {
    if (!Array.isArray(buffers)) {
      throw new TypeError('"buffers" must be an Array of Buffers');
    }

    if (buffers.length === 0) {
      return Buffer.from([]);
    }

    totalLength = totalLength ?? buffers.reduce((sum, buf) => sum + buf.length, 0);

    const result = new Buffer(totalLength);
    let offset = 0;
    for (const buffer of buffers) {
      result.set(buffer, offset);
      offset += buffer.length;
    }

    return result;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports.Buffer = Buffer;
}
