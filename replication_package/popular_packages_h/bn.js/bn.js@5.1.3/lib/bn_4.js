(function (module, exports) {
  'use strict';

  // Assert utility to check conditions
  function assert(val, msg) {
    if (!val) throw new Error(msg || 'Assertion failed');
  }

  // Simple inheritance utility
  function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    var TempCtor = function () {};
    TempCtor.prototype = superCtor.prototype;
    ctor.prototype = new TempCtor();
    ctor.prototype.constructor = ctor;
  }

  // Big Number (BN) Class
  function BN(number, base, endian) {
    if (BN.isBN(number)) {
      return number;
    }

    this.negative = 0;
    this.words = null;
    this.length = 0;
    this.red = null; // Reduction context

    if (number !== null) {
      if (base === 'le' || base === 'be') {
        endian = base;
        base = 10;
      }

      this._init(number || 0, base || 10, endian || 'be');
    }
  }

  // Export BN class
  if (typeof module === 'object') {
    module.exports = BN;
  } else {
    exports.BN = BN;
  }

  BN.BN = BN;
  BN.wordSize = 26;

  // Import Buffer if available
  let Buffer;
  try {
    Buffer = require('buffer').Buffer;
  } catch (e) {}

  // Utility functions to identify BN instances
  BN.isBN = function isBN(num) {
    return num instanceof BN ||
      (num !== null && typeof num === 'object' &&
      num.constructor.wordSize === BN.wordSize && Array.isArray(num.words));
  };

  // Max and Min functions
  BN.max = function max(left, right) {
    return left.cmp(right) > 0 ? left : right;
  };

  BN.min = function min(left, right) {
    return left.cmp(right) < 0 ? left : right;
  };

  // Initialization logic based on types
  BN.prototype._init = function init(number, base, endian) {
    if (typeof number === 'number') {
      return this._initNumber(number, base, endian);
    }

    if (typeof number === 'object') {
      return this._initArray(number, base, endian);
    }

    if (base === 'hex') {
      base = 16;
    }
    assert(base === (base | 0) && base >= 2 && base <= 36);

    number = number.toString().replace(/\s+/g, '');
    let start = 0;
    if (number[0] === '-') {
      start++;
    }

    if (base === 16) {
      this._parseHex(number, start);
    } else {
      this._parseBase(number, base, start);
    }

    if (number[0] === '-') {
      this.negative = 1;
    }

    this._strip();

    if (endian !== 'le') return;

    this._initArray(this.toArray(), base, endian);
  };

  // Number Initialization
  BN.prototype._initNumber = function _initNumber(number, base, endian) {
    if (number < 0) {
      this.negative = 1;
      number = -number;
    }
    if (number < 0x4000000) {
      this.words = [number & 0x3ffffff];
      this.length = 1;
    } else if (number < 0x10000000000000) {
      this.words = [
        number & 0x3ffffff,
        (number / 0x4000000) & 0x3ffffff
      ];
      this.length = 2;
    } else {
      assert(number < 0x20000000000000);
      this.words = [
        number & 0x3ffffff,
        (number / 0x4000000) & 0x3ffffff,
        1
      ];
      this.length = 3;
    }

    if (endian !== 'le') return;

    this._initArray(this.toArray(), base, endian);
  };

  // Array Initialization
  BN.prototype._initArray = function _initArray(number, base, endian) {
    assert(typeof number.length === 'number');
    if (number.length <= 0) {
      this.words = [0];
      this.length = 1;
      return this;
    }

    this.length = Math.ceil(number.length / 3);
    this.words = new Array(this.length).fill(0);

    let j, w, off = 0;

    if (endian === 'be') {
      for (let i = number.length - 1, j = 0; i >= 0; i -= 3) {
        w = number[i] | (number[i - 1] << 8) | (number[i - 2] << 16);
        this.words[j] |= (w << off) & 0x3ffffff;
        this.words[j + 1] |= (w >>> (26 - off)) & 0x3ffffff;

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
        this.words[j + 1] |= (w >>> (26 - off)) & 0x3ffffff;

        off += 24;
        if (off >= 26) {
          off -= 26;
          j++;
        }
      }
    }
    return this._strip();
  };

  // Helper functions for parsing

  function parseHex(str, start, end) {
    let r = 0, len = Math.min(str.length, end), z = 0;
    for (let i = start; i < len; i++) {
      let c = str.charCodeAt(i) - 48;

      r <<= 4;
      let b;

      if (c >= 49 && c <= 54) {
        b = c - 49 + 0xa;
      } else if (c >= 17 && c <= 22) {
        b = c - 17 + 0xa;
      } else {
        b = c;
      }

      r |= b;
      z |= b;
    }

    assert(!(z & 0xf0), 'Invalid character in ' + str);
    return r;
  }

  BN.prototype._parseHex = function _parseHex(number, start) {
    this.length = Math.ceil((number.length - start) / 6);
    this.words = new Array(this.length).fill(0);

    let j, w, off = 0;

    for (let i = number.length - 6, j = 0; i >= start; i -= 6) {
      w = parseHex(number, i, i + 6);
      this.words[j] |= (w << off) & 0x3ffffff;
      this.words[j + 1] |= (w >>> (26 - off)) & 0x3fffff;

      off += 24;
      if (off >= 26) {
        off -= 26;
        j++;
      }
    }
    if (i + 6 !== start) {
      w = parseHex(number, start, i + 6);
      this.words[j] |= (w << off) & 0x3ffffff;
      this.words[j + 1] |= w >>> (26 - off) & 0x3fffff;
    }
    this._strip();
  };

  function parseBase(str, start, end, mul) {
    let r = 0, b = 0, len = Math.min(str.length, end);
    for (let i = start; i < len; i++) {
      let c = str.charCodeAt(i) - 48;

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

  BN.prototype._parseBase = function _parseBase(number, base, start) {
    this.words = [0];
    this.length = 1;

    let limbLen = 0, limbPow = 1;
    while (limbPow <= 0x3ffffff) {
      limbPow *= base;
      limbLen++;
    }
    limbLen--;
    limbPow = (limbPow / base) | 0;

    let total = number.length - start;
    let mod = total % limbLen;
    let end = Math.min(total, total - mod) + start;

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
  };

  // Copying and Cloning
  BN.prototype.copy = function copy(dest) {
    dest.words = new Array(this.length);
    for (let i = 0; i < this.length; i++) {
      dest.words[i] = this.words[i];
    }
    dest.length = this.length;
    dest.negative = this.negative;
    dest.red = this.red;
  };

  function move(dest, src) {
    dest.words = src.words;
    dest.length = src.length;
    dest.negative = src.negative;
    dest.red = src.red;
  }

  BN.prototype._move = function _move(dest) {
    move(dest, this);
  };

  BN.prototype.clone = function clone() {
    const r = new BN(null);
    this.copy(r);
    return r;
  };

  BN.prototype._expand = function _expand(size) {
    while (this.length < size) {
      this.words[this.length++] = 0;
    }
    return this;
  };

  // Strip leading zeros
  BN.prototype._strip = function strip() {
    while (this.length > 1 && this.words[this.length - 1] === 0) {
      this.length--;
    }
    return this._normSign();
  };

  BN.prototype._normSign = function _normSign() {
    if (this.length === 1 && this.words[0] === 0) {
      this.negative = 0;
    }
    return this;
  };

  function inspect() {
    return (this.red ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>';
  }

  // Add inspect symbol if available
  if (typeof Symbol !== 'undefined' && typeof Symbol.for === 'function') {
    try {
      BN.prototype[Symbol.for('nodejs.util.inspect.custom')] = inspect;
    } catch (e) {
      BN.prototype.inspect = inspect;
    }
  } else {
    BN.prototype.inspect = inspect;
  }

  const zeros = [
    '', '0', '00', '000', '0000', '00000', '000000', '0000000',
    '00000000', '000000000', '0000000000', '00000000000', '000000000000',
    '0000000000000', '00000000000000', '000000000000000',
    '0000000000000000', '00000000000000000', '000000000000000000',
    '0000000000000000000', '00000000000000000000', '000000000000000000000',
    '0000000000000000000000', '00000000000000000000000',
    '000000000000000000000000', '0000000000000000000000000'
  ];

  const groupSizes = [
    0, 0, 25, 16, 12, 11, 10, 9, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5
  ];

  const groupBases = [
    0, 0, 33554432, 43046721, 16777216, 48828125, 60466176, 40353607,
    16777216, 43046721, 10000000, 19487171, 35831808, 62748517, 7529536,
    11390625, 16777216, 24137569, 34012224, 47045881, 64000000, 4084101,
    5153632, 6436343, 7962624, 9765625, 11881376, 14348907, 17210368,
    20511149, 24300000, 28629151, 33554432, 39135393, 45435424, 52521875,
    60466176
  ];

  BN.prototype.toString = function toString(base, padding) {
    base = base || 10;
    padding = padding | 0 || 1;

    let out;
    if (base === 16 || base === 'hex') {
      out = '';
      let off = 0, carry = 0;
      for (let i = 0; i < this.length; i++) {
        const w = this.words[i];
        const word = (((w << off) | carry) & 0xffffff).toString(16);
        carry = (w >>> (24 - off)) & 0xffffff;
        if (carry !== 0 || i !== this.length - 1) {
          out = zeros[6 - word.length] + word + out;
        } else {
          out = word + out;
        }
        off += 2;
        if (off >= 26) {
          off -= 26;
          i--;
        }
      }
      if (carry !== 0) {
        out = carry.toString(16) + out;
      }
      while (out.length % padding !== 0) {
        out = '0' + out;
      }
      if (this.negative !== 0) {
        out = '-' + out;
      }
      return out;
    }

    if (base === (base | 0) && base >= 2 && base <= 36) {
      let groupSize = groupSizes[base];
      let groupBase = groupBases[base];
      out = '';
      let c = this.clone();
      c.negative = 0;
      while (!c.isZero()) {
        const r = c.modrn(groupBase).toString(base);
        c = c.idivn(groupBase);

        if (!c.isZero()) {
          out = zeros[groupSize - r.length] + r + out;
        } else {
          out = r + out;
        }
      }
      if (this.isZero()) {
        out = '0' + out;
      }
      while (out.length % padding !== 0) {
        out = '0' + out;
      }
      if (this.negative !== 0) {
        out = '-' + out;
      }
      return out;
    }

    assert(false, 'Base should be between 2 and 36');
  };

  BN.prototype.toNumber = function toNumber() {
    let ret = this.words[0];
    if (this.length === 2) {
      ret += this.words[1] * 0x4000000;
    } else if (this.length === 3 && this.words[2] === 0x01) {
      ret += 0x10000000000000 + (this.words[1] * 0x4000000);
    } else if (this.length > 2) {
      assert(false, 'Number can only safely store up to 53 bits');
    }
    return (this.negative !== 0) ? -ret : ret;
  };

  BN.prototype.toJSON = function toJSON() {
    return this.toString(16, 2);
  };

  if (Buffer) {
    BN.prototype.toBuffer = function toBuffer(endian, length) {
      return this.toArrayLike(Buffer, endian, length);
    };
  }

  BN.prototype.toArray = function toArray(endian, length) {
    return this.toArrayLike(Array, endian, length);
  };

  const allocate = function allocate(ArrayType, size) {
    if (ArrayType.allocUnsafe) {
      return ArrayType.allocUnsafe(size);
    }
    return new ArrayType(size);
  };

  BN.prototype.toArrayLike = function toArrayLike(ArrayType, endian, length) {
    this._strip();

    const byteLength = this.byteLength();
    const reqLength = length || Math.max(1, byteLength);
    assert(byteLength <= reqLength, 'byte array longer than desired length');
    assert(reqLength > 0, 'Requested array length <= 0');

    const res = allocate(ArrayType, reqLength);
    const postfix = endian === 'le' ? 'LE' : 'BE';
    this['_toArrayLike' + postfix](res, byteLength);
    return res;
  };

  BN.prototype._toArrayLikeLE = function _toArrayLikeLE(res, byteLength) {
    let position = 0;
    let carry = 0;

    for (let i = 0, shift = 0; i < this.length; i++) {
      const word = (this.words[i] << shift) | carry;

      res[position++] = word & 0xff;
      if (position < res.length) {
        res[position++] = (word >> 8) & 0xff;
      }
      if (position < res.length) {
        res[position++] = (word >> 16) & 0xff;
      }

      if (shift === 6) {
        if (position < res.length) {
          res[position++] = (word >> 24) & 0xff;
        }
        carry = 0;
        shift = 0;
      } else {
        carry = word >>> 24;
        shift += 2;
      }
    }

    if (position < res.length) {
      res[position++] = carry;

      while (position < res.length) {
        res[position++] = 0;
      }
    }
  };

  BN.prototype._toArrayLikeBE = function _toArrayLikeBE(res, byteLength) {
    let position = res.length - 1;
    let carry = 0;

    for (let i = 0, shift = 0; i < this.length; i++) {
      const word = (this.words[i] << shift) | carry;

      res[position--] = word & 0xff;
      if (position >= 0) {
        res[position--] = (word >> 8) & 0xff;
      }
      if (position >= 0) {
        res[position--] = (word >> 16) & 0xff;
      }

      if (shift === 6) {
        if (position >= 0) {
          res[position--] = (word >> 24) & 0xff;
        }
        carry = 0;
        shift = 0;
      } else {
        carry = word >>> 24;
        shift += 2;
      }
    }

    if (position >= 0) {
      res[position--] = carry;

      while (position >= 0) {
        res[position--] = 0;
      }
    }
  };

  if (Math.clz32) {
    BN.prototype._countBits = function _countBits(w) {
      return 32 - Math.clz32(w);
    };
  } else {
    BN.prototype._countBits = function _countBits(w) {
      let t = w;
      let r = 0;
      if (t >= 0x1000) {
        r += 13;
        t >>>= 13;
      }
      if (t >= 0x40) {
        r += 7;
        t >>>= 7;
      }
      if (t >= 0x8) {
        r += 4;
        t >>>= 4;
      }
      if (t >= 0x02) {
        r += 2;
        t >>>= 2;
      }
      return r + t;
    };
  }

  BN.prototype._zeroBits = function _zeroBits(w) {
    if (w === 0) return 26;

    let t = w;
    let r = 0;
    if ((t & 0x1fff) === 0) {
      r += 13;
      t >>>= 13;
    }
    if ((t & 0x7f) === 0) {
      r += 7;
      t >>>= 7;
    }
    if ((t & 0xf) === 0) {
      r += 4;
      t >>>= 4;
    }
    if ((t & 0x3) === 0) {
      r += 2;
      t >>>= 2;
    }
    if ((t & 0x1) === 0) {
      r++;
    }
    return r;
  };

  BN.prototype.bitLength = function bitLength() {
    const w = this.words[this.length - 1];
    const hi = this._countBits(w);
    return (this.length - 1) * 26 + hi;
  };

  function toBitArray(num) {
    const w = new Array(num.bitLength());

    for (let bit = 0; bit < w.length; bit++) {
      const off = (bit / 26) | 0;
      const wbit = bit % 26;

      w[bit] = (num.words[off] >>> wbit) & 0x01;
    }

    return w;
  }

  BN.prototype.zeroBits = function zeroBits() {
    if (this.isZero()) return 0;

    let r = 0;
    for (let i = 0; i < this.length; i++) {
      const b = this._zeroBits(this.words[i]);
      r += b;
      if (b !== 26) break;
    }
    return r;
  };

  BN.prototype.byteLength = function byteLength() {
    return Math.ceil(this.bitLength() / 8);
  };

  BN.prototype.toTwos = function toTwos(width) {
    if (this.negative !== 0) {
      return this.abs().inotn(width).iaddn(1);
    }
    return this.clone();
  };

  BN.prototype.fromTwos = function fromTwos(width) {
    if (this.testn(width - 1)) {
      return this.notn(width).iaddn(1).ineg();
    }
    return this.clone();
  };

  BN.prototype.isNeg = function isNeg() {
    return this.negative !== 0;
  };

  // Negation of `this`
  BN.prototype.neg = function neg() {
    return this.clone().ineg();
  };

  BN.prototype.ineg = function ineg() {
    if (!this.isZero()) {
      this.negative ^= 1;
    }
    return this;
  };

  // Bitwise OR
  BN.prototype.iuor = function iuor(num) {
    while (this.length < num.length) {
      this.words[this.length++] = 0;
    }

    for (let i = 0; i < num.length; i++) {
      this.words[i] |= num.words[i];
    }
    return this._strip();
  };

  BN.prototype.ior = function ior(num) {
    assert((this.negative | num.negative) === 0);
    return this.iuor(num);
  };

  BN.prototype.or = function or(num) {
    return (this.length > num.length ? this.clone() : num.clone()).ior(this);
  };

  BN.prototype.uor = function uor(num) {
    return (this.length > num.length ? this.clone() : num.clone()).iuor(this);
  };

  // Bitwise AND
  BN.prototype.iuand = function iuand(num) {
    const minLength = Math.min(this.length, num.length);
    for (let i = 0; i < minLength; i++) {
      this.words[i] &= num.words[i];
    }
    this.length = minLength;
    return this._strip();
  };

  BN.prototype.iand = function iand(num) {
    assert((this.negative | num.negative) === 0);
    return this.iuand(num);
  };

  BN.prototype.and = function and(num) {
    return (this.length > num.length ? this.clone() : num.clone()).iand(this);
  };

  BN.prototype.uand = function uand(num) {
    return (this.length > num.length ? this.clone() : num.clone()).iuand(this);
  };

  // Bitwise XOR
  BN.prototype.iuxor = function iuxor(num) {
    const maxLength = Math.max(this.length, num.length);

    for (let i = 0; i < maxLength; i++) {
      this.words[i] ^= num.words[i];
    }

    this.length = maxLength;
    return this._strip();
  };

  BN.prototype.ixor = function ixor(num) {
    assert((this.negative | num.negative) === 0);
    return this.iuxor(num);
  };

  BN.prototype.xor = function xor(num) {
    return (this.length > num.length ? this.clone() : num.clone()).ixor(this);
  };

  BN.prototype.uxor = function uxor(num) {
    return (this.length > num.length ? this.clone() : num.clone()).iuxor(this);
  };

  // Bitwise NOT with width
  BN.prototype.inotn = function inotn(width) {
    assert(typeof width === 'number' && width >= 0);

    const bytesNeeded = Math.ceil(width / 26);
    const bitsLeft = width % 26;

    this._expand(bytesNeeded);

    if (bitsLeft > 0) {
      bytesNeeded--;
    }

    for (let i = 0; i < bytesNeeded; i++) {
      this.words[i] = ~this.words[i] & 0x3ffffff;
    }

    if (bitsLeft > 0) {
      this.words[bytesNeeded] = ~this.words[bytesNeeded] & (0x3ffffff >> (26 - bitsLeft));
    }

    return this._strip();
  };

  BN.prototype.notn = function notn(width) {
    return this.clone().inotn(width);
  };

  // Set a bit
  BN.prototype.setn = function setn(bit, val) {
    assert(typeof bit === 'number' && bit >= 0);

    const off = (bit / 26) | 0;
    const wbit = bit % 26;

    this._expand(off + 1);

    if (val) {
      this.words[off] |= (1 << wbit);
    } else {
      this.words[off] &= ~(1 << wbit);
    }

    return this._strip();
  };

  // In-place Addition
  BN.prototype.iadd = function iadd(num) {
    const maxLength = Math.max(this.length, num.length);

    if (this.negative !== 0 && num.negative === 0) {
      this.negative = 0;
      const r = this.isub(num);
      this.negative ^= 1;
      return this._normSign();
    } else if (this.negative === 0 && num.negative !== 0) {
      num.negative = 0;
      const r = this.isub(num);
      num.negative = 1;
      return r._normSign();
    }

    this._expand(maxLength);

    let carry = 0;
    for (let i = 0; i < maxLength; i++) {
      const r = (this.words[i] | 0) + (num.words[i] | 0) + carry;
      this.words[i] = r & 0x3ffffff;
      carry = r >>> 26;
    }

    if (carry !== 0) {
      this.words[maxLength] = carry;
      this.length = maxLength + 1;
    } else {
      this.length = maxLength;
    }

    return this._strip();
  };

  BN.prototype.add = function add(num) {
    if (this.negative !== 0 && num.negative === 0) {
      num.negative = 0;
      const r = this.sub(num);
      num.negative ^= 1;
      return r;
    } else if (this.negative === 0 && num.negative !== 0) {
      this.negative = 0;
      const r = num.sub(this);
      this.negative = 1;
      return r;
    }

    return (this.length > num.length ? this.clone() : num.clone()).iadd(this);
  };

  // In-place Subtraction
  BN.prototype.isub = function isub(num) {
    if (num.negative !== 0) {
      num.negative = 0;
      const r = this.iadd(num);
      num.negative = 1;
      return r._normSign();
    } else if (this.negative !== 0) {
      this.negative = 0;
      const r = this.iadd(num);
      this.negative = 1;
      return r._normSign();
    }

    const cmp = this.cmp(num);

    if (cmp === 0) {
      this.negative = 0;
      this.words[0] = 0;
      this.length = 1;
      return this;
    }

    let a = this, b = num;
    if (cmp < 0) {
      a = num;
      b = this;
    }

    let carry = 0;
    for (let i = 0; i < b.length; i++) {
      let r = (a.words[i] | 0) - (b.words[i] | 0) + carry;
      carry = r >> 26;
      this.words[i] = r & 0x3ffffff;
    }

    for (; carry !== 0 && i < a.length; i++) {
      r = (a.words[i] | 0) + carry;
      carry = r >> 26;
      this.words[i] = r & 0x3ffffff;
    }

    for (; i < a.length; i++) {
      this.words[i] = a.words[i];
    }

    this.length = a.length;

    if (cmp < 0) {
      this.negative = 1;
    }

    return this._strip();
  };

  BN.prototype.sub = function sub(num) {
    return this.clone().isub(num);
  };

  // Multiplication (small)
  function smallMulTo(self, num, out) {
    out.negative = self.negative ^ num.negative;
    out.length = self.length + num.length;

    let carry = 0;

    for (let k = 0; k < out.length - 1; k++) {
      let ncarry = carry >>> 26;
      let rword = carry & 0x3ffffff;

      for (let j = Math.max(0, k - self.length + 1); j <= Math.min(k, num.length - 1); j++) {
        const i = k - j;
        const a = self.words[i] | 0;
        const b = num.words[j] | 0;
        const r = a * b;

        ncarry += (r / 0x4000000) | 0;
        rword += r & 0x3ffffff;
      }

      out.words[k] = rword | 0;
      carry = ncarry | 0;
    }

    if (carry !== 0) {
      out.words[out.length - 1] = carry | 0;
    } else {
      out.length--;
    }

    return out._strip();
  }

  // Multiplication (large)
  function bigMulTo(self, num, out) {
    out.negative = self.negative ^ num.negative;
    out.length = self.length + num.length;

    let carry = 0;

    for (let k = 0; k < out.length - 1; k++) {
      let ncarry = carry >>> 26;
      let rword = carry & 0x3ffffff;

      for (let j = Math.max(0, k - self.length + 1); j <= Math.min(k, num.length - 1); j++) {
        const i = k - j;
        const a = self.words[i] | 0;
        const b = num.words[j] | 0;
        const r = a * b;

        ncarry += (r / 0x4000000) | 0;
        rword += r & 0x3ffffff;
      }

      out.words[k] = rword | 0;
      carry = ncarry | 0;
    }

    if (carry !== 0) {
      out.words[out.length - 1] = carry | 0;
    } else {
      out.length--;
    }

    return out._strip();
  }

  // Fast Fourier Transform for large multiplications
  function FFTM(x, y) {
    this.x = x;
    this.y = y;
  }

  FFTM.prototype.makeRBT = function makeRBT(N) {
    const t = new Array(N);
    const l = BN.prototype._countBits(N) - 1;

    for (let i = 0; i < N; i++) {
      t[i] = this.revBin(i, l, N);
    }

    return t;
  };

  FFTM.prototype.revBin = function revBin(x, l, N) {
    if (x === 0 || x === N - 1) return x;

    let rb = 0;

    for (let i = 0; i < l; i++) {
      rb |= (x & 1) << (l - i - 1);
      x >>= 1;
    }

    return rb;
  };

  FFTM.prototype.permute = function permute(rbt, rws, iws, rtws, itws, N) {
    for (let i = 0; i < N; i++) {
      rtws[i] = rws[rbt[i]];
      itws[i] = iws[rbt[i]];
    }
  };

  FFTM.prototype.transform = function transform(rws, iws, rtws, itws, N, rbt) {
    this.permute(rbt, rws, iws, rtws, itws, N);

    for (let s = 1; s < N; s <<= 1) {
      const l = s << 1;

      const rtwdf = Math.cos(2 * Math.PI / l);
      const itwdf = Math.sin(2 * Math.PI / l);

      for (let p = 0; p < N; p += l) {
        let rtwdf_ = rtwdf;
        let itwdf_ = itwdf;

        for (let j = 0; j < s; j++) {
          const re = rtws[p + j];
          const ie = itws[p + j];

          let ro = rtws[p + j + s];
          let io = itws[p + j + s];

          const rx = rtwdf_ * ro - itwdf_ * io;
          io = rtwdf_ * io + itwdf_ * ro;
          ro = rx;

          rtws[p + j] = re + ro;
          itws[p + j] = ie + io;

          rtws[p + j + s] = re - ro;
          itws[p + j + s] = ie - io;

          if (j !== l) {
            const rx_ = rtwdf * rtwdf_ - itwdf * itwdf_;

            itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_;
            rtwdf_ = rx_;
          }
        }
      }
    }
  };

  FFTM.prototype.guessLen13b = function guessLen13b(n, m) {
    let N = Math.max(m, n) | 1;
    const odd = N & 1;
    let i = 0;

    for (N = N / 2 | 0; N; N = N >>> 1) {
      i++;
    }

    return 1 << (i + 1 + odd);
  };

  FFTM.prototype.conjugate = function conjugate(rws, iws, N) {
    if (N <= 1) return;

    for (let i = 0; i < N / 2; i++) {
      let t = rws[i];
      rws[i] = rws[N - i - 1];
      rws[N - i - 1] = t;

      t = iws[i];
      iws[i] = -iws[N - i - 1];
      iws[N - i - 1] = -t;
    }
  };

  FFTM.prototype.normalize13b = function normalize13b(ws, N) {
    let carry = 0;

    for (let i = 0; i < N / 2; i++) {
      const w = Math.round(ws[2 * i + 1] / N) * 0x2000 +
        Math.round(ws[2 * i] / N) +
        carry;

      ws[i] = w & 0x3ffffff;

      carry = (w < 0x4000000) ? 0 : (w / 0x4000000) | 0;
    }

    return ws;
  };

  FFTM.prototype.convert13b = function convert13b(ws, len, rws, N) {
    let carry = 0;

    for (let i = 0; i < len; i++) {
      carry = carry + (ws[i] | 0);
      rws[2 * i] = carry & 0x1fff;
      carry >>>= 13;
      rws[2 * i + 1] = carry & 0x1fff;
      carry >>>= 13;
    }

    for (let i = 2 * len; i < N; ++i) {
      rws[i] = 0;
    }

    assert(carry === 0);
    assert((carry & ~0x1fff) === 0);
  };

  FFTM.prototype.stub = function stub(N) {
    return new Array(N).fill(0);
  };

  FFTM.prototype.mulp = function mulp(x, y, out) {
    const N = 2 * this.guessLen13b(x.length, y.length);
    const rbt = this.makeRBT(N);

    const _ = this.stub(N);
    const rws = new Array(N);
    const rwst = new Array(N);
    const iwst = new Array(N);

    const nrws = new Array(N);
    const nrwst = new Array(N);
    const niwst = new Array(N);

    const rmws = out.words;
    rmws.length = N;

    this.convert13b(x.words, x.length, rws, N);
    this.convert13b(y.words, y.length, nrws, N);

    this.transform(rws, _, rwst, iwst, N, rbt);
    this.transform(nrws, _, nrwst, niwst, N, rbt);

    for (let i = 0; i < N; i++) {
      const rx = rwst[i] * nrwst[i] - iwst[i] * niwst[i];
      iwst[i] = rwst[i] * niwst[i] + iwst[i] * nrwst[i];
      rwst[i] = rx;
    }

    this.conjugate(rwst, iwst, N);
    this.transform(rwst, iwst, rmws, _, N, rbt);
    this.conjugate(rmws, _, N);
    this.normalize13b(rmws, N);

    out.negative = x.negative ^ y.negative;
    out.length = x.length + y.length;
    return out._strip();
  };

  // Multiply `this` by `num`
  BN.prototype.mulTo = function mulTo(num, out) {
    const res;
    const len = this.length + num.length;

    if (len < 63) {
      res = smallMulTo(this, num, out);
    } else if (len < 1024) {
      res = bigMulTo(this, num, out);
    } else {
      const fftm = new FFTM();
      res = fftm.mulp(this, num, out);
    }
    return res;
  };

  BN.prototype.mul = function mul(num) {
    const out = new BN(null);
    out.words = new Array(this.length + num.length);
    return this.mulTo(num, out);
  };

  BN.prototype.mulf = function mulf(num) {
    const out = new BN(null);
    out.words = new Array(this.length + num.length);
    return new FFTM().mulp(this, num, out);
  };

  BN.prototype.imul = function imul(num) {
    return this.clone().mulTo(num, this);
  };

  BN.prototype.imuln = function imuln(num) {
    if (num < 0) num = -num;
    assert(typeof num === 'number');
    assert(num < 0x4000000);

    let carry = 0;
    for (let i = 0; i < this.length; i++) {
      const w = (this.words[i] | 0) * num;
      const lo = (w & 0x3ffffff) + (carry & 0x3ffffff);
      carry >>= 26;
      carry += (w / 0x4000000) | 0;
      carry += lo >>> 26;
      this.words[i] = lo & 0x3ffffff;
    }

    if (carry !== 0) {
      this.words[i] = carry;
      this.length++;
    }

    return num < 0 ? this.ineg() : this;
  };

  BN.prototype.muln = function muln(num) {
    return this.clone().imuln(num);
  };

  BN.prototype.sqr = function sqr() {
    return this.mul(this);
  };

  BN.prototype.isqr = function isqr() {
    return this.imul(this.clone());
  };

  BN.prototype.pow = function pow(num) {
    const w = toBitArray(num);

    let res = this;
    for (let i = 0; i < w.length; i++, res = res.sqr()) {
      if (w[i] === 1) res = res.mul(res);
    }

    return res;
  };

  BN.prototype.iushln = function iushln(bits) {
    assert(typeof bits === 'number' && bits >= 0);
    const r = bits % 26;
    const s = (bits - r) / 26;

    if (r !== 0) {
      let carry = 0;
      for (let i = 0; i < this.length; i++) {
        const newCarry = this.words[i] & ((0x3ffffff >>> (26 - r)) << (26 - r));
        const c = ((this.words[i] | 0) - newCarry) << r;
        this.words[i] = c | carry;
        carry = newCarry >>> (26 - r);
      }

      if (carry) {
        this.words[this.length] = carry;
        this.length++;
      }
    }

    if (s !== 0) {
      for (let i = this.length - 1; i >= 0; i--) {
        this.words[i + s] = this.words[i];
      }

      for (let i = 0; i < s; i++) {
        this.words[i] = 0;
      }

      this.length += s;
    }

    return this._strip();
  };

  BN.prototype.ishln = function ishln(bits) {
    assert(this.negative === 0);
    return this.iushln(bits);
  };

  BN.prototype.iushrn = function iushrn(bits, hint, extended) {
    assert(typeof bits === 'number' && bits >= 0);

    const r = bits % 26;
    const s = Math.min((bits - r) / 26, this.length);
    const mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
    const maskedWords = extended;

    if (maskedWords) {
      for (let i = 0; i < s; i++) {
        maskedWords.words[i] = this.words[i];
      }
      maskedWords.length = s;
    }

    if (s === 0) {
    } else if (this.length > s) {
      this.length -= s;
      for (let i = 0; i < this.length; i++) {
        this.words[i] = this.words[i + s];
      }
    } else {
      this.words[0] = 0;
      this.length = 1;
    }

    let carry = 0;
    for (let i = this.length - 1; i >= 0 && (carry !== 0); i--) {
      const word = this.words[i] | 0;
      this.words[i] = (carry << (26 - r)) | (word >>> r);
      carry = word & mask;
    }

    if (maskedWords && carry !== 0) {
      maskedWords.words[maskedWords.length++] = carry;
    }

    if (this.length === 0) {
      this.words[0] = 0;
      this.length = 1;
    }

    return this._strip();
  };

  BN.prototype.ishrn = function ishrn(bits, hint, extended) {
    assert(this.negative === 0);
    return this.iushrn(bits, hint, extended);
  };

  BN.prototype.shln = function shln(bits) {
    return this.clone().ishln(bits);
  };

  BN.prototype.ushln = function ushln(bits) {
    return this.clone().iushln(bits);
  };

  BN.prototype.shrn = function shrn(bits) {
    return this.clone().ishrn(bits);
  };

  BN.prototype.ushrn = function ushrn(bits) {
    return this.clone().iushrn(bits);
  };

  BN.prototype.testn = function testn(bit) {
    assert(typeof bit === 'number' && bit >= 0);

    const off = (bit / 26) | 0;
    const wbit = bit % 26;

    if (this.length <= off) return false;

    return !!((this.words[off] >> wbit) & 1);
  };

  BN.prototype.imaskn = function imaskn(bits) {
    assert(typeof bits === 'number' && bits >= 0);
    const r = bits % 26;
    const s = (bits - r) / 26;

    this.negative = 0;

    if (this.length <= s) {
      return this;
    }

    if (r !== 0) {
      this.length = Math.min(s + 1, this.length);

      this.words[s] &= 0x3ffffff ^ ((0x3ffffff >>> r) << r);
    } else {
      this.length = Math.min(s, this.length);
    }
    return this._strip();
  };

  BN.prototype.maskn = function maskn(bits) {
    return this.clone().imaskn(bits);
  };

  BN.prototype.iaddn = function iaddn(num) {
    assert(typeof num === 'number' && num < 0x4000000);

    if (num < 0) return this.isubn(-num);

    if (this.negative !== 0) {
      if (this.length === 1 && (this.words[0] | 0) <= num) {
        this.words[0] = num - (this.words[0] | 0);
        this.negative = 0;
        return this;
      }

      this.negative = 0;
      this.isubn(num);
      this.negative = 1;
      return this;
    }

    this.words[0] += num;

    for (let i = 0; i < this.length && this.words[i] >= 0x4000000; i++) {
      this.words[i] -= 0x4000000;
      if (i === this.length - 1) {
        this.words[i + 1] = 1;
      } else {
        this.words[i + 1]++;
      }
    }
    this.length = Math.max(this.length, i + 1);

    return this;
  };

  BN.prototype._iaddn = function _iaddn(num) {
    assert(typeof num === 'number' && num < 0x4000000);
    this.words[0] += num;

    for (let i = 0; i < this.length && this.words[i] >= 0x4000000; i++) {
      this.words[i] -= 0x4000000;
      if (i === this.length - 1) {
        this.words[i + 1] = 1;
      } else {
        this.words[i + 1]++;
      }
    }
    this.length = Math.max(this.length, i + 1);

    return this;
  };

  BN.prototype.isubn = function isubn(num) {
    assert(typeof num === 'number' && num < 0x4000000);

    if (num < 0) return this.iaddn(-num);

    if (this.negative !== 0) {
      this.negative = 0;
      this.iaddn(num);
      this.negative = 1;
      return this;
    }

    this.words[0] -= num;

    if (this.length === 1 && this.words[0] < 0) {
      this.words[0] = -this.words[0];
      this.negative = 1;
    } else {
      for (let i = 0; i < this.length && this.words[i] < 0; i++) {
        this.words[i] += 0x4000000;
        this.words[i + 1] -= 1;
      }
    }
    return this._strip();
  };

  BN.prototype.addn = function addn(num) {
    return this.clone().iaddn(num);
  };

  BN.prototype.subn = function subn(num) {
    return this.clone().isubn(num);
  };

  BN.prototype.iabs = function iabs() {
    this.negative = 0;
    return this;
  };

  BN.prototype.abs = function abs() {
    return this.clone().iabs();
  };

  BN.prototype._ishlnsubmul = function _ishlnsubmul(num, mul, shift) {
    const len = num.length + shift;
    this._expand(len);

    let carry = 0;
    for (let i = 0; i < num.length; i++) {
      let w = (this.words[i + shift] | 0) + carry;
      const right = (num.words[i] | 0) * mul;
      w -= right & 0x3ffffff;
      carry = (w >> 26) - ((right / 0x4000000) | 0);
      this.words[i + shift] = w & 0x3ffffff;
    }

    for (let i = num.length + shift; carry !== 0 && i < this.length; i++) {
      let w = (this.words[i] | 0) + carry;
      carry = w >> 26;
      this.words[i] = w & 0x3ffffff;
    }

    if (carry === 0) return this._strip();

    carry = 0;
    for (let i = 0; i < this.length; i++) {
      let w = -(this.words[i] | 0) + carry;
      carry = w >> 26;
      this.words[i] = w & 0x3ffffff;
    }
    this.negative = 1;

    return this._strip();
  };

  BN.prototype._wordDiv = function _wordDiv(num, mode) {
    const shift = this.length - num.length;

    let a = this.clone();
    const b = num;

    const bhi = b.words[b.length - 1] | 0;
    const bhiBits = this._countBits(bhi);
    const n = 26 - bhiBits;
    const bhiShifted = bhi << n;

    if (n !== 0) {
      b = b.ushln(n);
      a.iushln(n);
    }

    const m = a.length - b.length;
    let q = mode !== 'mod' ? new BN(null) : null;
    if (q) {
      q.length = m + 1;
      q.words = new Array(q.length).fill(0);
    }

    let diff = a.clone()._ishlnsubmul(b, 1, m);
    if (diff.negative === 0) {
      a = diff;
      if (q) {
        q.words[m] = 1;
      }
    }

    for (let j = m - 1; j >= 0; j--) {
      let qj = (a.words[b.length + j] | 0) * 0x4000000 +
        (a.words[b.length + j - 1] | 0);

      qj = Math.min((qj / bhiShifted) | 0, 0x3ffffff);

      a._ishlnsubmul(b, qj, j);
      while (a.negative !== 0) {
        qj--;
        a.negative = 0;
        a._ishlnsubmul(b, 1, j);
        if (!a.isZero()) a.negative ^= 1;
      }
      if (q) {
        q.words[j] = qj;
      }
    }

    if (q) q._strip();
    a._strip();

    if (mode !== 'div' && n !== 0) {
      a.iushrn(n);
    }

    return { div: q || null, mod: a };
  };

  // Division and Modulo
  BN.prototype.divmod = function divmod(num, mode) {
    assert(!num.isZero());

    const div = null, mod = null;
    if (this.isZero()) {
      return { div: new BN(0), mod: new BN(0) };
    }

    if (this.negative !== 0 && num.negative === 0) {
      const result = this.neg().divmod(num, mode);
      if (mode !== 'mod') result.div = result.div.neg();
      if (mode !== 'div') result.mod = result.mod.neg();
      return result;
    }

    if (this.negative === 0 && num.negative !== 0) {
      const result = this.divmod(num.neg(), mode);
      if (mode !== 'mod') result.div = result.div.neg();
      return result;
    }

    if ((this.negative & num.negative) !== 0) {
      const result = this.neg().divmod(num.neg(), mode);
      if (mode !== 'div') result.mod = result.mod.neg();
      return result;
    }

    if (num.length > this.length || this.cmp(num) < 0) {
      return { div: new BN(0), mod: this };
    }

    if (num.length === 1) {
      if (mode === 'div') {
        return { div: this.divn(num.words[0]), mod: null };
      }

      if (mode === 'mod') {
        return { div: null, mod: new BN(this.modrn(num.words[0])) };
      }

      return {
        div: this.divn(num.words[0]),
        mod: new BN(this.modrn(num.words[0]))
      };
    }

    return this._wordDiv(num, mode);
  };

  BN.prototype.div = function div(num) {
    return this.divmod(num, 'div', false).div;
  };

  BN.prototype.mod = function mod(num) {
    return this.divmod(num, 'mod', false).mod;
  };

  BN.prototype.umod = function umod(num) {
    return this.divmod(num, 'mod', true).mod;
  };

  BN.prototype.divRound = function divRound(num) {
    const dm = this.divmod(num);

    if (dm.mod.isZero()) return dm.div;

    const half = num.ushrn(1);
    const cmp = dm.mod.cmp(half);

    if (cmp < 0 || (num.andln(1) === 1 && cmp === 0)) return dm.div;

    return this.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
  };

  BN.prototype.modrn = function modrn(num) {
    num = Math.abs(num);
    assert(num <= 0x3ffffff);
    const p = 1 << 26 % num;

    let acc = 0;
    for (let i = this.length - 1; i >= 0; i--) {
      acc = (p * acc + (this.words[i] | 0)) % num;
    }

    return this.negative !== 0 ? -acc : acc;
  };

  BN.prototype.modn = function modn(num) {
    return this.modrn(num);
  };

  BN.prototype.idivn = function idivn(num) {
    num = Math.abs(num);
    assert(num <= 0x3ffffff);

    let carry = 0;
    for (let i = this.length - 1; i >= 0; i--) {
      const w = (this.words[i] | 0) + carry * 0x4000000;
      this.words[i] = (w / num) | 0;
      carry = w % num;
    }

    this._strip();
    return this.negative !== 0 ? this.ineg() : this;
  };

  BN.prototype.divn = function divn(num) {
    return this.clone().idivn(num);
  };

  BN.prototype.egcd = function egcd(p) {
    assert(p.negative === 0);
    assert(!p.isZero());

    let x = this;
    let y = p.clone();

    if (x.negative !== 0) x = x.umod(p);
    else x = x.clone();

    let A = new BN(1), B = new BN(0), C = new BN(0), D = new BN(1);

    let g = 0;

    while (x.isEven() && y.isEven()) {
      x.iushrn(1);
      y.iushrn(1);
      g++;
    }

    const yp = y.clone();
    const xp = x.clone();

    while (!x.isZero()) {
      x.iushrn(x._countBits(x.words[0]) % 26);
      C.iadd(yp);

      y.iushrn(y._countBits(y.words[0]) % 26);
      D.isub(xp);

      if (x.cmp(y) >= 0) {
        x.isub(y);
        A.isub(C);
        B.isub(D);
      } else {
        y.isub(x);
        C.isub(A);
        D.isub(B);
      }
    }

    return { a: C, b: D, gcd: y.iushln(g) };
  };

  BN.prototype._invmp = function _invmp(p) {
    assert(p.negative === 0);
    assert(!p.isZero());

    let a = this;
    let b = p.clone();

    if (a.negative !== 0) a = a.umod(p);
    else a = a.clone();

    let x1 = new BN(1), x2 = new BN(0);
    const delta = b.clone();

    while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
      a.iushrn(a._countBits(a.words[0]) % 26);
      if (x1.isOdd()) x1.iadd(delta);
      x1.iushrn(1);

      b.iushrn(b._countBits(b.words[0]) % 26);
      if (x2.isOdd()) x2.iadd(delta);
      x2.iushrn(1);

      if (a.cmp(b) >= 0) {
        a.isub(b);
        x1.isub(x2);
      } else {
        b.isub(a);
        x2.isub(x1);
      }
    }

    const res = a.cmpn(1) === 0 ? x1 : x2;
    return res.cmpn(0) < 0 ? res.iadd(p) : res;
  };

  BN.prototype.gcd = function gcd(num) {
    if (this.isZero()) return num.abs();
    if (num.isZero()) return this.abs();

    let a = this.clone();
    let b = num.clone();
    a.negative = 0;
    b.negative = 0;

    let shift = 0;
    while (a.isEven() && b.isEven()) {
      a.iushrn(1);
      b.iushrn(1);
      shift++;
    }

    while (!a.isZero() && !b.isZero()) {
      while (a.isEven()) a.iushrn(1);
      while (b.isEven()) b.iushrn(1);

      if (a.cmp(b) >= 0) {
        a.isub(b);
      } else {
        b.isub(a);
      }
    }

    return b.iushln(shift);
  };

  BN.prototype.invm = function invm(num) {
    return this.egcd(num).a.umod(num);
  };

  BN.prototype.isEven = function isEven() {
    return (this.words[0] & 1) === 0;
  };

  BN.prototype.isOdd = function isOdd() {
    return (this.words[0] & 1) === 1;
  };

  BN.prototype.andln = function andln(num) {
    return this.words[0] & num;
  };

  BN.prototype.bincn = function bincn(bit) {
    assert(typeof bit === 'number');
    const r = bit % 26;
    const s = (bit - r) / 26;
    const q = 1 << r;

    if (this.length <= s) {
      this._expand(s + 1);
      this.words[s] |= q;
      return this;
    }

    let carry = q;
    for (let i = s; carry !== 0 && i < this.length; i++) {
      let w = this.words[i] | 0;
      w += carry;
      carry = w >>> 26;
      w &= 0x3ffffff;
      this.words[i] = w;
    }

    if (carry !== 0) {
      this.words[i] = carry;
      this.length++;
    }
    return this;
  };

  BN.prototype.isZero = function isZero() {
    return this.length === 1 && this.words[0] === 0;
  };

  BN.prototype.cmpn = function cmpn(num) {
    if (this.negative !== 0 && num >= 0) return -1;
    if (this.negative === 0 && num < 0) return 1;

    this._strip();

    const res = this.length > 1 ? 1 : this.words[0] - Math.abs(num);
    return res < 0 ? -1 : (res > 0 ? 1 : 0);
  };

  BN.prototype.cmp = function cmp(num) {
    if (this.negative !== 0 && num.negative === 0) return -1;
    if (this.negative === 0 && num.negative !== 0) return 1;

    const res = this.ucmp(num);
    return this.negative !== 0 ? -res : res;
  };

  BN.prototype.ucmp = function ucmp(num) {
    if (this.length > num.length) return 1;
    if (this.length < num.length) return -1;

    for (let i = this.length - 1; i >= 0; i--) {
      const a = this.words[i] | 0;
      const b = num.words[i] | 0;

      if (a !== b) return a < b ? -1 : 1;
    }
    return 0;
  };

  BN.prototype.gtn = function gtn(num) {
    return this.cmpn(num) > 0;
  };

  BN.prototype.gt = function gt(num) {
    return this.cmp(num) > 0;
  };

  BN.prototype.gten = function gten(num) {
    return this.cmpn(num) >= 0;
  };

  BN.prototype.gte = function gte(num) {
    return this.cmp(num) >= 0;
  };

  BN.prototype.ltn = function ltn(num) {
    return this.cmpn(num) < 0;
  };

  BN.prototype.lt = function lt(num) {
    return this.cmp(num) < 0;
  };

  BN.prototype.lten = function lten(num) {
    return this.cmpn(num) <= 0;
  };

  BN.prototype.lte = function lte(num) {
    return this.cmp(num) <= 0;
  };

  BN.prototype.eqn = function eqn(num) {
    return this.cmpn(num) === 0;
  };

  BN.prototype.eq = function eq(num) {
    return this.cmp(num) === 0;
  };

  BN.red = function red(num) {
    return new Red(num);
  };

  BN.prototype.toRed = function toRed(ctx) {
    assert(!this.red, 'Already a number in reduction context');
    this.negative = 0;
    return ctx.convertTo(this)._forceRed(ctx);
  };

  BN.prototype.fromRed = function fromRed() {
    assert(this.red, 'fromRed works only with numbers in reduction context');
    return this.red.convertFrom(this);
  };

  BN.prototype._forceRed = function _forceRed(ctx) {
    this.red = ctx;
    return this;
  };

  BN.prototype.forceRed = function forceRed(ctx) {
    assert(!this.red, 'Already a number in reduction context');
    return this._forceRed(ctx);
  };

  BN.prototype.redAdd = function redAdd(num) {
    assert(this.red, 'redAdd works only with red numbers');
    return this.red.add(this, num);
  };

  BN.prototype.redIAdd = function redIAdd(num) {
    assert(this.red, 'redIAdd works only with red numbers');
    return this.red.iadd(this, num);
  };

  BN.prototype.redSub = function redSub(num) {
    assert(this.red, 'redSub works only with red numbers');
    return this.red.sub(this, num);
  };

  BN.prototype.redISub = function redISub(num) {
    assert(this.red, 'redISub works only with red numbers');
    return this.red.isub(this, num);
  };

  BN.prototype.redShl = function redShl(num) {
    assert(this.red, 'redShl works only with red numbers');
    return this.red.shl(this, num);
  };

  BN.prototype.redMul = function redMul(num) {
    assert(this.red, 'redMul works only with red numbers');
    this.red._verify2(this, num);
    return this.red.mul(this, num);
  };

  BN.prototype.redIMul = function redIMul(num) {
    assert(this.red, 'redMul works only with red numbers');
    this.red._verify2(this, num);
    return this.red.imul(this, num);
  };

  BN.prototype.redSqr = function redSqr() {
    assert(this.red, 'redSqr works only with red numbers');
    this.red._verify1(this);
    return this.red.sqr(this);
  };

  BN.prototype.redISqr = function redISqr() {
    assert(this.red, 'redISqr works only with red numbers');
    this.red._verify1(this);
    return this.red.isqr(this);
  };

  BN.prototype.redSqrt = function redSqrt() {
    assert(this.red, 'redSqrt works only with red numbers');
    this.red._verify1(this);
    return this.red.sqrt(this);
  };

  BN.prototype.redInvm = function redInvm() {
    assert(this.red, 'redInvm works only with red numbers');
    this.red._verify1(this);
    return this.red.invm(this);
  };

  BN.prototype.redNeg = function redNeg() {
    assert(this.red, 'redNeg works only with red numbers');
    this.red._verify1(this);
    return this.red.neg(this);
  };

  BN.prototype.redPow = function redPow(num) {
    assert(this.red && !num.red, 'redPow(normalNum)');
    this.red._verify1(this);
    return this.red.pow(this, num);
  };

  // Prime numbers with efficient reduction
  const primes = {
    k256: null,
    p224: null,
    p192: null,
    p25519: null
  };

  function MPrime(name, p) {
    this.name = name;
    this.p = new BN(p, 16);
    this.n = this.p.bitLength();
    this.k = new BN(1).iushln(this.n).isub(this.p);
    this.tmp = this._tmp();
  }

  MPrime.prototype._tmp = function _tmp() {
    return new BN(null);
  };

  MPrime.prototype.ireduce = function ireduce(num) {
    let r = num, rlen;

    do {
      this.split(r, this.tmp);
      r = this.imulK(r);
      r = r.iadd(this.tmp);
      rlen = r.bitLength();
    } while (rlen > this.n);

    const cmp = rlen < this.n ? -1 : r.ucmp(this.p);
    if (cmp === 0) {
      r.words[0] = 0;
      r.length = 1;
    } else if (cmp > 0) {
      r.isub(this.p);
    } else {
      r._strip();
    }

    return r;
  };

  MPrime.prototype.split = function split(input, out) {
    input.iushrn(this.n, 0, out);
  };

  MPrime.prototype.imulK = function imulK(num) {
    return num.imul(this.k);
  };

  function K256() {
    MPrime.call(this, 'k256', 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f');
  }
  inherits(K256, MPrime);

  K256.prototype.split = function split(input, output) {
    let outLen = Math.min(input.length, 9);
    for (let i = 0; i < outLen; i++) {
      output.words[i] = input.words[i];
    }
    output.length = outLen;

    if (input.length <= 9) {
      input.words[0] = 0;
      input.length = 1;
      return;
    }

    const prev = input.words[9];
    output.words[output.length++] = prev & 0x3fffff;

    for (let i = 10; i < input.length; i++) {
      const next = input.words[i];
      input.words[i - 10] = ((next & 0x3fffff) << 4) | (prev >>> 22);
    }
  };

  K256.prototype.imulK = function imulK(num) {
    num.words[num.length] = 0;
    num.words[num.length + 1] = 0;
    num.length += 2;

    let lo = 0;
    for (let i = 0; i < num.length; i++) {
      const w = num.words[i] | 0;
      lo += w * 0x3d1;
      num.words[i] = lo & 0x3ffffff;
      lo = w * 0x40 + ((lo / 0x4000000) | 0);
    }

    if (num.words[num.length - 1] === 0) {
      num.length--;
      if