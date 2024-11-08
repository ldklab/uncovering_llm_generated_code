class Buffer extends Uint8Array {
  constructor(arg, encodingOrOffset, length) {
    if (typeof arg === 'number') {
      super(arg);
    } else if (typeof arg === 'string') {
      super(Buffer._encodeString(arg, encodingOrOffset));
    } else if (arg instanceof ArrayBuffer) {
      super(arg, encodingOrOffset, length);
    } else {
      super(arg.length);
      this._initializeFrom(arg);
    }
  }

  static _encodeString(str, encoding = 'utf8') {
    if (encoding !== 'utf8') {
      throw new Error('Unsupported encoding: only utf8 is implemented');
    }
    return new TextEncoder().encode(str);
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
      throw new TypeError('"list" argument must be an Array of Buffers');
    }

    if (buffers.length === 0) {
      return Buffer.from([]);
    }

    if (totalLength === undefined) {
      totalLength = buffers.reduce((len, buf) => len + buf.length, 0);
    }

    const result = new Buffer(totalLength);
    let offset = 0;
    for (const buffer of buffers) {
      result.set(buffer, offset);
      offset += buffer.length;
    }

    return result;
  }

  _initializeFrom(source) {
    for (let i = 0; i < source.length; i++) {
      this[i] = source[i];
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports.Buffer = Buffer;
}
