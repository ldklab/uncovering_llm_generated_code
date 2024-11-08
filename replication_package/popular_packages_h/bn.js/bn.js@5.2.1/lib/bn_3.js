(function (global) {
  'use strict';

  class BN {
    static wordSize = 26;

    constructor(number, base = 10, endian = 'be') {
      if (BN.isBN(number)) return number;

      this.negative = 0;
      this.words = null;
      this.length = 0;
      this.red = null;

      if (number !== null) {
        if (base === 'le' || base === 'be') {
          endian = base;
          base = 10;
        }
        this._initialize(number || 0, base, endian);
      }
    }

    static isBN(num) {
      return num instanceof BN ||
             (num !== null && typeof num === 'object' && num.constructor.wordSize === BN.wordSize && Array.isArray(num.words));
    }

    // Initialization functions
    _initialize(number, base, endian) {
      if (typeof number === 'number') {
        this._initNumber(number, base, endian);
      } else if (typeof number === 'object') {
        this._initArray(number, base, endian);
      } else if (typeof number === 'string') {
        if (base === 'hex') base = 16;
        assert(base >= 2 && base <= 36, 'Base should be between 2 and 36');
        number = number.trim();
        if (number[0] === '-') this.negative = 1;
        this._parse(number, base, endian);
      }
    }
    
    // Helper and utility functions
    static max(left, right) {
      return left.cmp(right) > 0 ? left : right;
    }

    static min(left, right) {
      return left.cmp(right) < 0 ? left : right;
    }

    copy(dest) {
      dest.words = [...this.words];
      dest.length = this.length;
      dest.negative = this.negative;
      dest.red = this.red;
    }
    
    _expand(size) {
      while (this.length < size) {
        this.words[this.length++] = 0;
      }
      return this;
    }

    _strip() {
      while (this.length > 1 && this.words[this.length - 1] === 0) {
        this.length--;
      }
      return this._normalizeSign();
    }

    _normalizeSign() {
      if (this.length === 1 && this.words[0] === 0) {
        this.negative = 0;
      }
      return this;
    }

    // Arithmetic operations
    iadd(num) {
      if (this.negative !== 0 && num.negative === 0) {
        this.negative = 0;
        return this.isub(num)._toggleSign();
      } else if (this.negative === 0 && num.negative !== 0) {
        num.negative = 0;
        return this.isub(num);
      }

      const a = this.length > num.length ? this : num;
      const b = this.length > num.length ? num : this;

      let carry = 0;
      for (let i = 0; i < b.length; i++) {
        let result = (a.words[i] | 0) + (b.words[i] | 0) + carry;
        b.words[i] = result & 0x3ffffff;
        carry = result >>> 26;
      }

      for (; carry !== 0 && i < a.length; i++) {
        let result = (a.words[i] | 0) + carry;
        b.words[i] = result & 0x3ffffff;
        carry = result >>> 26;
      }

      if (a !== b) {
        for (; i < a.length; i++) {
          b.words[i] = a.words[i];
        }
      }

      b.length = Math.max(b.length, a.length);
      if (carry !== 0) {
        b.words[b.length++] = carry;
      }

      return b;
    }

    isub(num) {
      if (num.negative !== 0) {
        num.negative = 0;
        const result = this.iadd(num);
        num.negative = 1;
        return result._toggleSign();
      } else if (this.negative !== 0) {
        this.negative = 0;
        this.iadd(num);
        return this._toggleSign();
      }

      const cmp = this.cmp(num);
      const a = cmp > 0 ? this : num;
      const b = cmp > 0 ? num : this;

      let carry = 0;
      for (let i = 0; i < b.length; i++) {
        let result = (a.words[i] | 0) - (b.words[i] | 0) + carry;
        carry = result >> 26;
        b.words[i] = result & 0x3ffffff;
      }

      for (; carry !== 0 && i < a.length; i++) {
        let result = (a.words[i] | 0) + carry;
        carry = result >> 26;
        b.words[i] = result & 0x3ffffff;
      }

      b.length = Math.max(b.length, i);
      if (a !== b) {
        this.negative = 1;
      }

      return b._strip();
    }

    mul(num) {
      const out = new BN(null);
      out.words = new Array(this.length + num.length);
      return this.mulTo(num, out);
    }

    imul(num) {
      return this.clone().mulTo(num, this);
    }

    mulTo(num, out) {
      const len = this.length + num.length;
      if (this.length === 10 && num.length === 10) {
        return comb10MulTo(this, num, out);
      } else if (len < 63) {
        return smallMulTo(this, num, out);
      } else if (len < 1024) {
        return bigMulTo(this, num, out);
      } else {
        return jumboMulTo(this, num, out);
      }
    }

    // Additional utility methods
    clone() {
      const r = new BN(null);
      this.copy(r);
      return r;
    }

    bitLength() {
      const w = this.words[this.length - 1];
      const hi = this._countBits(w);
      return (this.length - 1) * 26 + hi;
    }

    isZero() {
      return this.length === 1 && this.words[0] === 0;
    }

    _toggleSign() {
      if (!this.isZero()) {
        this.negative ^= 1;
      }
      return this;
    }

    // Inspection and conversion
    toString(base = 10, padding = 1) {
      if (base === 16 || base === 'hex') {
        let out = '', off = 0, carry = 0;
        for (let i = 0; i < this.length; i++) {
          const w = this.words[i];
          const word = ((w << off) | carry).toString(16);
          carry = w >>> (24 - off);
          off += 2;
          if (off >= 26) {
            off -= 26;
            i--;
          }
          if (carry || i !== this.length - 1) {
            out = zeros[6 - word.length] + word + out;
          } else {
            out = word + out;
          }
        }
        if (carry) {
          out = carry.toString(16) + out;
        }
        while (out.length % padding) {
          out = '0' + out;
        }
        if (this.negative !== 0) out = '-' + out;
        return out;
      }
      assert(false, 'Base should be between 2 and 36');
    }

    toNumber() {
      let ret = this.words[0];
      if (this.length === 2) {
        ret += this.words[1] * 0x4000000;
      } else if (this.length === 3 && this.words[2] === 0x01) {
        ret += 0x10000000000000 + (this.words[1] * 0x4000000);
      } else if (this.length > 2) {
        assert(false, 'Number can only safely store up to 53 bits');
      }
      return this.negative !== 0 ? -ret : ret;
    }

    toJSON() {
      return this.toString(16, 2);
    }

    toArray(endian, length) {
      return this.toArrayLike(Array, endian, length);
    }

    // Internals
    _parse(number, base, endian) {
      let start = this.negative ? 1 : 0;
      if (start < number.length) {
        if (base === 16) {
          this._parseHex(number, start, endian);
        } else {
          this._parseBase(number, base, start);
          if (endian === 'le') {
            this._initArray(this.toArray(), base, endian);
          }
        }
      }
    }

    _parseBase(number, base, start) {
      this.words = [0];
      this.length = 1;

      const limbLen = groupSizes[base];
      const limbPow = groupBases[base];

      const total = number.length - start;
      const mod = total % limbLen;
      const end = Math.min(total, total - mod) + start;

      let word = 0;
      for (let i = start; i < end; i += limbLen) {
        word = parseBase(number, i, i + limbLen, base);

        this.imuln(limbPow);
        if (this.words[0] + word < 0x4000000) {
          this.words[0] += word;
        } else {
          this._iaddn(word);
        }
      }

      if (mod !== 0) {
        let pow = 1;
        word = parseBase(number, i, number.length, base);

        for (i = 0; i < mod; i++) {
          pow *= base;
        }

        this.imuln(pow);
        if (this.words[0] + word < 0x4000000) {
          this.words[0] += word;
        } else {
          this._iaddn(word);
        }
      }

      this._strip();
    }
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = BN;
  } else {
    global.BN = BN;
  }

  // Utilities and helper functions
  function assert(val, msg) {
    if (!val) throw new Error(msg || 'Assertion failed');
  }

  function parseBase(str, start, end, mul) {
    let r = 0;
    let b = 0;
    const len = Math.min(str.length, end);
    for (let i = start; i < len; i++) {
      const c = str.charCodeAt(i) - 48;

      r *= mul;

      if (c >= 49) {
        b = c - 49 + 0xa;
      } else if (c >= 17) {
        b = c - 17 + 0xa;
      } else {
        b = c;
      }
      assert(c >= 0 && b < mul, 'Invalid character');
      r += b;
    }
    return r;
  }

  const zeros = [
    '', '0', '00', '000', '0000', '00000', '000000', '0000000',
    '00000000', '000000000', '0000000000', '00000000000',
    '000000000000', '0000000000000', '00000000000000',
    '000000000000000', '0000000000000000', '00000000000000000'
  ];
  
  const groupSizes = [
    0, 0, 25, 16, 12, 11, 10, 9, 8,
    8, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6,
    6, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5
  ];

  const groupBases = [
    0, 0, 33554432, 43046721, 16777216, 48828125,
    60466176, 40353607, 16777216, 43046721, 10000000,
    19487171, 35831808, 62748517, 7529536, 11390625,
    16777216, 24137569, 34012224, 47045881, 64000000,
    4084101, 5153632, 6436343, 7962624, 9765625,
    11881376, 14348907, 17210368, 20511149, 24300000,
    28629151, 33554432, 39135393, 45435424, 52521875,
    60466176
  ];

})(typeof window !== 'undefined' ? window : global);
