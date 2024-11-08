// node-int64.js

const isBuffer = (input) => input instanceof Buffer;

class Int64 {
  constructor(arg1, arg2) {
    if (typeof arg1 === 'number') {
      this._value = arg1 > Number.MAX_SAFE_INTEGER ? Infinity : arg1;
      this._octets = this._numberToOctets(this._value);
    } else if (typeof arg1 === 'string') {
      this._octets = this._stringToOctets(arg1);
      this._value = this._octetsToNumber(this._octets);
    } else if (isBuffer(arg1)) {
      const offset = arg2 || 0;
      this._octets = arg1.slice(offset, offset + 8);
      this._value = this._octetsToNumber(this._octets);
    }

    Object.defineProperty(this, 'value', {
      get: () => this._value,
    });
  }

  _numberToOctets(number) {
    const buffer = Buffer.allocUnsafe(8);
    buffer.writeUInt32BE(number >>> 32, 0);
    buffer.writeUInt32BE(number & 0xFFFFFFFF, 4);
    return buffer;
  }

  _stringToOctets(hexString) {
    const buffer = Buffer.from(hexString, 'hex');
    return buffer.length === 8 ? buffer : Buffer.concat([Buffer.alloc(8 - buffer.length), buffer], 8);
  }

  _octetsToNumber(buffer) {
    const high = buffer.readUInt32BE(0) * 0x100000000;
    const low = buffer.readUInt32BE(4);
    return high + low;
  }

  toString(base = 10) {
    return this._value === Infinity ? 'Infinity' : this._value.toString(base);
  }

  toOctetString() {
    return this._octets.toString('hex');
  }

  toBuffer() {
    return this._octets;
  }

  copy(buffer, offset = 0) {
    this._octets.copy(buffer, offset);
  }
}

module.exports = Int64;
