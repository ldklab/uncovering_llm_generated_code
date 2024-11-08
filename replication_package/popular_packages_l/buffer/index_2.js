// Simplified Buffer implementation for browsers using Typed Arrays

class Buffer extends Uint8Array {
  constructor(input, encodingOrOffset, length) {
    if (typeof input === 'number') {
      super(input);
    } else if (typeof input === 'string') {
      super(Buffer._stringToBuffer(input, encodingOrOffset));
    } else if (input instanceof ArrayBuffer) {
      super(input, encodingOrOffset, length);
    } else {
      super(input.length);
      for (let i = 0; i < input.length; i++) {
        this[i] = input[i];
      }
    }
  }

  static _stringToBuffer(str, encoding = 'utf8') {
    if (encoding !== 'utf8') {
      throw new Error('Currently, only UTF-8 encoding is supported');
    }
    return new TextEncoder().encode(str);
  }

  static from(input, encodingOrOffset, length) {
    return new Buffer(input, encodingOrOffset, length);
  }
  
  toString(encoding = 'utf8') {
    if (encoding !== 'utf8') {
      throw new Error('Currently, only UTF-8 encoding is supported');
    }
    return new TextDecoder().decode(this);
  }

  slice(start, end) {
    return new Buffer(super.slice(start, end));
  }

  static concat(bufferList, totalLength) {
    if (!Array.isArray(bufferList)) {
      throw new TypeError('The input should be an array of Buffers');
    }

    totalLength = totalLength ?? bufferList.reduce((sum, buf) => sum + buf.length, 0);

    let result = new Buffer(totalLength);
    let offset = 0;
    for (const buf of bufferList) {
      result.set(buf, offset);
      offset += buf.length;
    }

    return result;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports.Buffer = Buffer;
}
