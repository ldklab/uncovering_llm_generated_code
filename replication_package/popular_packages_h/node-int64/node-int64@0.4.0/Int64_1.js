// Int64.js
// Handling 64-bit integers in JavaScript (Node.js) with direct buffer manipulation.
// MIT License - Robert Kieffer

const MASK31 = 0x7fffffff;
const VAL31 = 0x80000000;
const MASK32 = 0xffffffff;
const VAL32 = 0x100000000;

// Hexadecimal conversion map
const _HEX = Array.from({ length: 256 }, (_, i) => (i > 0xF ? '' : '0') + i.toString(16));

class Int64 {
  // Initialize Int64 depending on the input type
  constructor(a1, a2) {
    if (a1 instanceof Buffer) {
      this.buffer = a1;
      this.offset = a2 || 0;
    } else if (Object.prototype.toString.call(a1) === '[object Uint8Array]') {
      this.buffer = Buffer.from(a1);
      this.offset = a2 || 0;
    } else {
      this.buffer = Buffer.alloc(8);
      this.offset = 0;
      this.setValue.apply(this, arguments);
    }
  }

  // Maximum and minimum integer values within JS precision
  static MAX_INT = Math.pow(2, 53);
  static MIN_INT = -Math.pow(2, 53);

  // In-place 2's complement transformation
  _2scomp() {
    let carry = 1;
    for (let i = this.offset + 7; i >= this.offset; i--) {
      const val = (this.buffer[i] ^ 0xff) + carry;
      this.buffer[i] = val & 0xff;
      carry = val >> 8;
    }
  }

  // Set Int64 value with various argument types
  setValue(hi, lo) {
    let negate = false;
    if (arguments.length === 1) {
      if (typeof hi === 'number') {
        negate = hi < 0;
        hi = Math.abs(hi);
        lo = hi % VAL32;
        hi = Math.floor(hi / VAL32);
        if (hi > VAL32) throw new RangeError(`${hi} is outside Int64 range`);
      } else if (typeof hi === 'string') {
        hi = hi.replace(/^0x/, '');
        lo = parseInt(hi.substr(-8), 16);
        hi = parseInt(hi.substr(0, Math.max(0, hi.length - 8)), 16);
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

  // Convert buffer to a JS number
  toNumber(allowImprecise = true) {
    let x = 0, carry = 1;
    const negate = this.buffer[this.offset] & 0x80;

    for (let i = 7, m = 1; i >= 0; i--, m *= 256) {
      let v = this.buffer[this.offset + i];
      if (negate) {
        v = (v ^ 0xff) + carry;
        carry = v >> 8;
        v &= 0xff;
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

  // Convert to string with optional base
  toString(radix = 10) {
    return this.valueOf().toString(radix);
  }

  // Convert buffer to octet string with separator
  toOctetString(sep = '') {
    return Array.from({ length: 8 }, (_, i) => _HEX[this.buffer[this.offset + i]]).join(sep);
  }

  // Return buffer with optional serialization consideration
  toBuffer(rawBuffer = false) {
    if (rawBuffer && this.offset === 0) return this.buffer;
    const out = Buffer.alloc(8);
    this.buffer.copy(out, 0, this.offset, this.offset + 8);
    return out;
  }

  // Copy buffer content to target buffer
  copy(targetBuffer, targetOffset = 0) {
    this.buffer.copy(targetBuffer, targetOffset, this.offset, this.offset + 8);
  }

  // Compare this Int64 to another
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

  // Check equality with another Int64
  equals(other) {
    return this.compare(other) === 0;
  }

  // Inspect object visually
  inspect() {
    return `[Int64 value: ${this} octets: ${this.toOctetString(' ')}]`;
  }
}

module.exports = Int64;
