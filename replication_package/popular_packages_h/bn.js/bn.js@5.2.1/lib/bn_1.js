(function (module, exports) {
  'use strict';

  const assert = (val, msg) => { if (!val) throw new Error(msg || 'Assertion failed'); };

  const inherits = (ctor, superCtor) => {
    ctor.super_ = superCtor;
    class TempCtor {}
    TempCtor.prototype = superCtor.prototype;
    ctor.prototype = new TempCtor();
    ctor.prototype.constructor = ctor;
  };

  class BN {
    constructor(number, base, endian) {
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
        this._init(number || 0, base || 10, endian || 'be');
      }
    }

    static isBN(num) {
      return num instanceof BN || (num !== null && typeof num === 'object' &&
        num.constructor.wordSize === BN.wordSize && Array.isArray(num.words));
    }

    static max(left, right) { return left.cmp(right) > 0 ? left : right; }
    static min(left, right) { return left.cmp(right) < 0 ? left : right; }

    _init(number, base, endian) {
      if (typeof number === 'number') return this._initNumber(number, base, endian);
      if (typeof number === 'object') return this._initArray(number, base, endian);

      if (base === 'hex') base = 16;
      assert(base === (base | 0) && base >= 2 && base <= 36);

      number = number.toString().replace(/\s+/g, '');
      let start = 0;
      if (number[0] === '-') {
        start++;
        this.negative = 1;
      }

      if (start < number.length) {
        if (base === 16) {
          this._parseHex(number, start, endian);
        } else {
          this._parseBase(number, base, start);
          if (endian === 'le') this._initArray(this.toArray(), base, endian);
        }
      }
    }

    _initNumber(number, base, endian) {
      if (number < 0) {
        this.negative = 1;
        number = -number;
      }
      if (number < 0x4000000) {
        this.words = [number & 0x3ffffff];
        this.length = 1;
      } else {
        assert(number < 0x20000000000000);
        this.words = [number & 0x3ffffff, (number / 0x4000000) & 0x3ffffff, 1];
        this.length = 3;
      }

      if (endian !== 'le') return;
      this._initArray(this.toArray(), base, endian);
    }

    _initArray(number, base, endian) {
      assert(typeof number.length === 'number');
      if (number.length <= 0) {
        this.words = [0];
        this.length = 1;
        return this;
      }

      this.length = Math.ceil(number.length / 3);
      this.words = new Array(this.length).fill(0);

      let j, w;
      let off = 0;
      if (endian === 'be') {
        for (let i = number.length - 1, j = 0; i >= 0; i -= 3) {
          w = number[i] | (number[i - 1] << 8) | (number[i - 2] << 16);
          this.words[j] |= (w << off) & 0x3ffffff;
          this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
          off += 24;
          if (off >= 26) {
            off -= 26;
            j++;
          }
        }
      } else if (endian === 'le') {
        for (let i = 0, j = 0; i < number.length; i += 3) {
          w = number[i] | (number[i + 1] << 8) | (number[i + 2] << 16);
          this.words[j] |= (w << off) & 0x3ffffff;
          this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
          off += 24;
          if (off >= 26) {
            off -= 26;
            j++;
          }
        }
      }
      return this._strip();
    }

    _parseHex(number, start, endian) {
      this.length = Math.ceil((number.length - start) / 6);
      this.words = new Array(this.length).fill(0);

      let off = 0;
      let j = 0;
      let w;
      if (endian === 'be') {
        for (let i = number.length - 1; i >= start; i -= 2) {
          w = parseHexByte(number, start, i) << off;
          this.words[j] |= w & 0x3ffffff;
          if (off >= 18) {
            off -= 18;
            j += 1;
            this.words[j] |= w >>> 26;
          } else {
            off += 8;
          }
        }
      } else {
        const parseLength = number.length - start;
        for (let i = parseLength % 2 === 0 ? start + 1 : start; i < number.length; i += 2) {
          w = parseHexByte(number, start, i) << off;
          this.words[j] |= w & 0x3ffffff;
          if (off >= 18) {
            off -= 18;
            j += 1;
            this.words[j] |= w >>> 26;
          } else {
            off += 8;
          }
        }
      }
      this._strip();
    }

    static parseHex4Bits(string, index) {
      const c = string.charCodeAt(index);
      if (c >= 48 && c <= 57) {
        return c - 48;
      } else if (c >= 65 && c <= 70) {
        return c - 55;
      } else if (c >= 97 && c <= 102) {
        return c - 87;
      } else {
        assert(false, 'Invalid character in ' + string);
      }
    }

    static parseHexByte(string, lowerBound, index) {
      let r = BN.parseHex4Bits(string, index);
      if (index - 1 >= lowerBound) {
        r |= BN.parseHex4Bits(string, index - 1) << 4;
      }
      return r;
    }

    _parseBase(number, base, start) {
      this.words = [0];
      this.length = 1;

      let limbLen = 0;
      let limbPow = 1;
      while (limbPow <= 0x3ffffff) {
        limbPow *= base;
        limbLen++;
      }
      limbLen--;
      limbPow = (limbPow / base) | 0;

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

        for (let i = 0; i < mod; i++) {
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

    copy(dest) {
      dest.words = new Array(this.length);
      for (let i = 0; i < this.length; i++) {
        dest.words[i] = this.words[i];
      }
      dest.length = this.length;
      dest.negative = this.negative;
      dest.red = this.red;
    }

    clone() {
      const r = new BN(null);
      this.copy(r);
      return r;
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
      return this._normSign();
    }

    _normSign() {
      if (this.length === 1 && this.words[0] === 0) {
        this.negative = 0;
      }
      return this;
    }

    _move(dest) {
      move(dest, this);
    }

    toArray(endian, length) {
      return this.toArrayLike(Array, endian, length);
    }

    toArrayLike(ArrayType, endian, length) {
      this._strip();

      const byteLength = this.byteLength();
      const reqLength = length || Math.max(1, byteLength);
      assert(byteLength <= reqLength, 'byte array longer than desired length');
      assert(reqLength > 0, 'Requested array length <= 0');

      const res = allocate(ArrayType, reqLength);
      const postfix = endian === 'le' ? 'LE' : 'BE';
      this['_toArrayLike' + postfix](res, byteLength);
      return res;
    }

    _toArrayLikeLE(res, byteLength) {
      let position = 0;
      let carry = 0;

      for (let i = 0, shift = 0; i < this.length; i++) {
        const word = (this.words[i] << shift) | carry;
        res[position++] = word & 0xff;
        if (position < res.length) res[position++] = (word >> 8) & 0xff;
        if (position < res.length) res[position++] = (word >> 16) & 0xff;
        if (shift === 6) {
          if (position < res.length) res[position++] = (word >> 24) & 0xff;
          carry = 0;
          shift = 0;
        } else {
          carry = word >>> 24;
          shift += 2;
        }
      }

      if (position < res.length) {
        res[position++] = carry;
        while (position < res.length) res[position++] = 0;
      }
    }

    _toArrayLikeBE(res, byteLength) {
      let position = res.length - 1;
      let carry = 0;

      for (let i = 0, shift = 0; i < this.length; i++) {
        const word = (this.words[i] << shift) | carry;
        res[position--] = word & 0xff;
        if (position >= 0) res[position--] = (word >> 8) & 0xff;
        if (position >= 0) res[position--] = (word >> 16) & 0xff;
        if (shift === 6) {
          if (position >= 0) res[position--] = (word >> 24) & 0xff;
          carry = 0;
          shift = 0;
        } else {
          carry = word >>> 24;
          shift += 2;
        }
      }

      if (position >= 0) {
        res[position--] = carry;
        while (position >= 0) res[position--] = 0;
      }
    }
  }

  BN.BN = BN;
  BN.wordSize = 26;

  let Buffer;
  try {
    Buffer = typeof window !== 'undefined' && typeof window.Buffer !== 'undefined' ? window.Buffer : require('buffer').Buffer;
  } catch (e) {}

  const allocate = (ArrayType, size) => ArrayType.allocUnsafe ? ArrayType.allocUnsafe(size) : new ArrayType(size);

  function move(dest, src) {
    dest.words = src.words;
    dest.length = src.length;
    dest.negative = src.negative;
    dest.red = src.red;
  }

  // Plenty of additional methods are not shown here due to length constraints
  // The rest of the methods would be implemented similarly, focusing on modular
  // arithmetic, multiplication, shifting, bit manipulation, comparison, etc.

  if (typeof module === 'object') {
    module.exports = BN;
  } else {
    exports.BN = BN;
  }

})(typeof module === 'undefined' || module, this);
