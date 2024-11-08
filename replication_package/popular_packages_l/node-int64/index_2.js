const isBuffer = (input) => input instanceof Buffer;

class Int64 {
  constructor(arg1, arg2) {
    let buffer;
    if (typeof arg1 === 'number') {
      this._value = arg1 > Number.MAX_SAFE_INTEGER ? Infinity : arg1;
      buffer = this._numberToOctets(this._value);
    } else if (typeof arg1 === 'string') {
      buffer = this._stringToOctets(arg1);
      this._value = this._octetsToNumber(buffer);
    } else if (isBuffer(arg1)) {
      const offset = arg2 || 0;
      buffer = arg1.slice(offset, offset + 8);
      this._value = this._octetsToNumber(buffer);
    }
    this._octets = buffer;
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
    return buffer.readUInt32BE(0) * 0x100000000 + buffer.readUInt32BE(4);
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

  copy(destinationBuffer, offset = 0) {
    this._octets.copy(destinationBuffer, offset);
  }

  get value() {
    return this._value;
  }
}

module.exports = Int64;
