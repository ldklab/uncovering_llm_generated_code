// Int64.js
// Copyright (c) 2012 Robert Kieffer
// MIT License

const MASK31 = 0x7fffffff, VAL31 = 0x80000000;
const MASK32 = 0xffffffff, VAL32 = 0x100000000;

const _HEX = Array.from({ length: 256 }, (_, i) => (i > 0xF ? '' : '0') + i.toString(16));

class Int64 {
  static MAX_INT = Math.pow(2, 53);
  static MIN_INT = -Math.pow(2, 53);

  constructor(a1, a2) {
    if (a1 instanceof Buffer || Object.prototype.toString.call(a1) === '[object Uint8Array]') {
      this.buffer = Buffer.isBuffer(a1) ? a1 : Buffer.from(a1);
      this.offset = a2 || 0;
    } else {
      this.buffer = Buffer.alloc(8);
      this.offset = 0;
      this.setValue(a1, a2);
    }
  }

  _2scomp() {
    const b = this.buffer, o = this.offset;
    let carry = 1;
    for (let i = o + 7; i >= o; i--) {
      const v = (b[i] ^ 0xff) + carry;
      b[i] = v & 0xff;
      carry = v >> 8;
    }
  }

  setValue(hi, lo) {
    let negate = false;
    if (arguments.length === 1) {
      if (typeof hi === 'number') {
        negate = hi < 0;
        hi = Math.abs(hi);
        lo = hi % VAL32;
        hi = hi / VAL32;
        if (hi > VAL32) throw RangeError(`${hi} is outside Int64 range`);
        hi = hi | 0;
      } else if (typeof hi === 'string') {
        const hex = hi.replace(/^0x/, '');
        lo = parseInt(hex.slice(-8), 16);
        hi = parseInt(hex.slice(0, -8) || '0', 16);
      } else {
        throw TypeError(`${hi} must be a Number or String`);
      }
    }

    const b = this.buffer, o = this.offset;
    for (let i = 7; i >= 0; i--) {
      b[o + i] = lo & 0xff;
      lo = i === 4 ? hi : lo >>> 8;
    }
    if (negate) this._2scomp();
  }

  toNumber(allowImprecise) {
    const b = this.buffer, o = this.offset;
    let negate = b[o] & 0x80, x = 0, carry = 1;
    for (let i = 7, m = 1; i >= 0; i--, m *= 256) {
      let v = b[o + i];
      if (negate) {
        v = (v ^ 0xff) + carry;
        carry = v >> 8;
        v = v & 0xff;
      }
      x += v * m;
    }

    if (!allowImprecise && x >= Int64.MAX_INT) {
      return negate ? -Infinity : Infinity;
    }
    return negate ? -x : x;
  }

  valueOf() {
    return this.toNumber(false);
  }

  toString(radix = 10) {
    return this.valueOf().toString(radix);
  }

  toOctetString(sep = '') {
    const b = this.buffer, o = this.offset;
    return Array.from({ length: 8 }, (_, i) => _HEX[b[o + i]]).join(sep);
  }

  toBuffer(rawBuffer = false) {
    if (rawBuffer && this.offset === 0) return this.buffer;
    const out = Buffer.alloc(8);
    this.buffer.copy(out, 0, this.offset, this.offset + 8);
    return out;
  }

  copy(targetBuffer, targetOffset = 0) {
    this.buffer.copy(targetBuffer, targetOffset, this.offset, this.offset + 8);
  }

  compare(other) {
    const thisByte = this.buffer[this.offset], otherByte = other.buffer[other.offset];
    if ((thisByte & 0x80) !== (otherByte & 0x80)) {
      return otherByte - thisByte;
    }
    for (let i = 0; i < 8; i++) {
      const a = this.buffer[this.offset + i], b = other.buffer[other.offset + i];
      if (a !== b) return a - b;
    }
    return 0;
  }

  equals(other) {
    return this.compare(other) === 0;
  }

  inspect() {
    return `[Int64 value: ${this} octets: ${this.toOctetString(' ')}]`;
  }
}

module.exports = Int64;
