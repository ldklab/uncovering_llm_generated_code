// Int64.js
// Copyright (c) 2012 Robert Kieffer
// MIT License - http://opensource.org/licenses/mit-license.php

/**
 * A class for handling 64-bit integer numbers in JavaScript using Node.js.
 *
 * As JavaScript naturally handles numbers using 64-bit floating-point format 
 * (IEEE-754), the Int64 class provides a way to manipulate 64-bit integers
 * using a Buffer as storage.
 */

const MASK31 = 0x7fffffff, VAL31 = 0x80000000;
const MASK32 = 0xffffffff, VAL32 = 0x100000000;

// Precompute hexadecimal string values for byte conversion
const _HEX = Array.from({ length: 256 }, (v, i) => (i > 0xF ? '' : '0') + i.toString(16));

class Int64 {
  static MAX_INT = Math.pow(2, 53);
  static MIN_INT = -Math.pow(2, 53);

  constructor(a1, a2) {
    if (Buffer.isBuffer(a1)) {
      this.buffer = a1;
      this.offset = a2 || 0;
    } else if (Object.prototype.toString.call(a1) === '[object Uint8Array]') {
      this.buffer = Buffer.from(a1);
      this.offset = a2 || 0;
    } else {
      this.buffer = new Buffer(8);
      this.offset = 0;
      this.setValue(a1, a2);
    }
  }

  _2scomp() {
    let carry = 1;
    for (let i = this.offset + 7; i >= this.offset; i--) {
      const v = (this.buffer[i] ^ 0xff) + carry;
      this.buffer[i] = v & 0xff;
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
        hi = Math.floor(hi / VAL32);
        if (hi >= VAL32) {
          throw new RangeError(`${hi} is outside Int64 range`);
        }
      } else if (typeof hi === 'string') {
        const hexString = hi.replace(/^0x/, '');
        lo = parseInt(hexString.slice(-8), 16);
        hi = parseInt(hexString.length > 8 ? hexString.slice(0, -8) : '0', 16);
      } else {
        throw new Error(`${hi} must be a Number or String`);
      }
    }

    for (let i = 7; i >= 0; i--) {
      this.buffer[this.offset + i] = lo & 0xff;
      lo = i === 4 ? hi : lo >>> 8;
    }

    if (negate) this._2scomp();
  }

  toNumber(allowImprecise) {
    let x = 0, carry = 1;
    const negate = (this.buffer[this.offset] & 0x80) !== 0;

    for (let i = 7, m = 1; i >= 0; i--, m *= 256) {
      let v = this.buffer[this.offset + i];
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
    return Array.from({ length: 8 }, (v, i) => _HEX[this.buffer[this.offset + i]]).join(sep);
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
    if ((this.buffer[this.offset] & 0x80) !== (other.buffer[other.offset] & 0x80)) {
      return other.buffer[other.offset] - this.buffer[this.offset];
    }
    for (let i = 0; i < 8; i++) {
      if (this.buffer[this.offset + i] !== other.buffer[other.offset + i]) {
        return this.buffer[this.offset + i] - other.buffer[other.offset + i];
      }
    }
    return 0;
  }

  equals(other) {
    return this.compare(other) === 0;
  }

  inspect() {
    return `[Int64 value:${this} octets:${this.toOctetString(' ')}]`;
  }
}

module.exports = Int64;
