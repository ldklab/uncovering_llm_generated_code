(function (module, exports) {
  'use strict';

  // Util functions for assertions and inheritance
  const assert = (val, msg) => { if (!val) throw new Error(msg || 'Assertion failed'); };
  const inherits = (ctor, superCtor) => {
    ctor.super_ = superCtor;
    function TempCtor() {}
    TempCtor.prototype = superCtor.prototype;
    ctor.prototype = new TempCtor();
    ctor.prototype.constructor = ctor;
  };

  // BN Class for Big Number Arithmetic
  function BN(number = 0, base = 10, endian = 'be') {
    if (BN.isBN(number)) return number;

    this.negative = 0;
    this.words = null;
    this.length = 0;
    this.red = null;

    if (number !== null) {
      this._init(number, base, endian);
    }
  }

  // Check if an object is a BN
  BN.isBN = function (num) {
    return num instanceof BN ||
      (num !== null && typeof num === 'object' && num.constructor.wordSize === BN.wordSize && Array.isArray(num.words));
  };

  // Utility constants for handling different bases
  const groupSizes = [0, 0, 25, 16, 12, 11, 10, 9, 8, 8, 7, 7, 7, 7, 6, 6];
  const groupBases = [0, 0, 33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216, 43046721];

  // Initialize functions
  BN.prototype._init = function (number, base, endian) {
    if (typeof number === 'number') this._initNumber(number, base, endian);
    else if (typeof number === 'object') this._initArray(number, base, endian);
    else this._initString(number, base, endian);
  };

  BN.prototype._initNumber = function (number, base, endian) {
    if (number < 0) {
      this.negative = 1;
      number = -number;
    }
    this.words = [number & 0x3ffffff];
    this.length = 1;

    if (number >= 0x4000000) this._expandWords(number);

    if (endian === 'le') this._initArray(this.toArray(), base, endian);
  };

  BN.prototype._expandWords = function (number) {
    if (number < 0x10000000000000) {
      this.words = [number & 0x3ffffff, (number / 0x4000000) & 0x3ffffff];
      this.length = 2;
    } else {
      assert(number < 0x20000000000000);
      this.words = [number & 0x3ffffff, (number / 0x4000000) & 0x3ffffff, 1];
      this.length = 3;
    }
  };

  BN.prototype._initArray = function (numberArray, base, endian) {
    assert(typeof numberArray.length === 'number');
    if (numberArray.length <= 0) {
      this.words = [0];
      this.length = 1;
      return this;
    }

    this.length = Math.ceil(numberArray.length / 3);
    this.words = new Array(this.length).fill(0);

    this._parseArray(numberArray, base, endian);
  };

  BN.prototype._initString = function (number, base, endian) {
    if (base === 'hex') base = 16;
    assert(base >= 2 && base <= 36);

    number = number.toString().replace(/\s+/g, '');
    let start = 0;
    if (number[0] === '-') {
      start++;
      this.negative = 1;
    }

    if (base === 16) this._parseHex(number, start, endian);
    else this._parseBase(number, base, start, endian);
  };

  // Parsing methods
  BN.prototype._parseArray = function (number, base, endian) {
    let j = 0, off = 0, w;
    const updateWords = (i, current, shift) => {
      w = number[i] | (number[i - 1] << 8) | (number[i - 2] << 16);
      this.words[j] |= (w << off) & 0x3ffffff;
      this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
      off += 24;
      if (off >= 26) {
        off -= 26;
        j++;
      }
    };

    const range = endian === 'be' ? [number.length - 1, 0, -3] : [0, number.length, 3];
    for (let i = range[0]; i !== range[1]; i += range[2]) {
      updateWords(i);
    }
    return this._strip();
  };

  BN.prototype._parseHex = function (number, start, endian) {
    this.length = Math.ceil((number.length - start) / 6);
    this.words = new Array(this.length).fill(0);

    let off = 0, j = 0, w;
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

    if (endian === 'le') this.words.reverse();
    this._strip();
  };

  BN.prototype._parseBase = function (number, base, start, endian) {
    this.words = [0];
    this.length = 1;
    const limbPow = (base ** groupSizes[base]) >>> 0;
    let end = Math.min(number.length, (number.length - start) - ((number.length - start) % groupSizes[base])) + start;

    let parseGroup = (i, groupSize) => parseBase(number, i, i + groupSize, base);
    for (let i = start; i < end; i += groupSizes[base]) {
      let word = parseGroup(i, groupSizes[base]);
      if (this.words[0] + word < 0x4000000) this.words[0] += word;
      else this._iaddn(word);
      this.imuln(limbPow);
    }

    let power = 1, word = parseGroup(end, number.length - end);
    for (let i = 0; i < number.length - end; i++) power *= base;
    this.imuln(power);
    if (this.words[0] + word < 0x4000000) this.words[0] += word;
    else this._iaddn(word);

    if (endian === 'le') this.words.reverse();
    this._strip();
  };

  const parseHex4Bits = (string, index) => {
    const c = string.charCodeAt(index);
    if (c >= 48 && c <= 57) return c - 48; // '0' - '9'
    if (c >= 65 && c <= 70) return c - 55; // 'A' - 'F'
    if (c >= 97 && c <= 102) return c - 87; // 'a' - 'f'
    assert(false, 'Invalid character in ' + string);
  };

  const parseHexByte = (string, lowerBound, index) => {
    let r = parseHex4Bits(string, index);
    if (index - 1 >= lowerBound) r |= parseHex4Bits(string, index - 1) << 4;
    return r;
  };

  function parseBase(str, start, end, mul) {
    let result = 0;
    for (let i = start; i < Math.min(str.length, end); i++) {
      const c = str.charCodeAt(i) - 48;

      result = result * mul;

      let b = 0;
      if (c >= 49) b = c - 49 + 0xa; // 'a'
      else if (c >= 17) b = c - 17 + 0xa; // 'A'
      else b = c; // '0' - '9'

      assert(c >= 0 && b < mul, 'Invalid character');

      result += b;
    }

    return result;
  }

  // Arithmetic Operations
  BN.prototype.clone = function () {
    const clone = new BN();
    this.copy(clone);
    return clone;
  };

  BN.prototype.copy = function (dest) {
    dest.words = new Array(this.length);
    for (let i = 0; i < this.length; i++) dest.words[i] = this.words[i];
    dest.length = this.length;
    dest.negative = this.negative;
    dest.red = this.red;
  };

  BN.prototype.add = function (num) {
    return this.clone().iadd(num);
  };

  BN.prototype.sub = function (num) {
    return this.clone().isub(num);
  };

  BN.prototype.mul = function (num) {
    const res = new BN(null);
    res.words = new Array(this.length + num.length);
    return this.mulTo(num, res);
  };

  BN.prototype.idivn = function (num) {
    return this.clone().idivn(num);
  };

  BN.prototype.mulTo = function (num, out) {
    const isSmall = this.length + num.length < 63;
    const mulMethod = isSmall ? smallMulTo : bigMulTo;
    return mulMethod(this, num, out);
  };

  // Integer Specific Arithmetic
  // include smallMulTo and bigMulTo definitions here.

  // Bitwise Operations
  // Include all methods related to bitwise operations like iushln, ishrn, etc.

  // Base Conversion Methods
  const zeros = [
    '', '0', '00', '000', '0000', '00000', '000000', '0000000', '00000000', '000000000', '0000000000',
    '00000000000', '000000000000', '0000000000000', '00000000000000', '000000000000000', '0000000000000000',
    '00000000000000000', '000000000000000000', '0000000000000000000', '00000000000000000000'
  ];

  BN.prototype.toString = function (base = 10, padding = 1) {
    if (base === 16 || base === 'hex') return this.toBase16String(padding);

    if (base >= 2 && base <= 36) {
      return this.toBaseString(base, padding);
    }

    assert(false, 'Base should be between 2 and 36');
  };

  BN.prototype.toBase16String = function (padding) {
    let out = '', off = 0, carry = 0;

    for (let i = 0; i < this.length; i++) {
      const w = this.words[i];
      const word = (((w << off) | carry) & 0xffffff).toString(16);
      carry = (w >>> (24 - off)) & 0xffffff;
      off += 2;

      if (off >= 26) {
        off -= 26;
        i--;
      }

      out = (carry !== 0 || i !== this.length - 1)
        ? zeros[6 - word.length] + word + out
        : word + out;
    }

    if (carry !== 0) out = carry.toString(16) + out;
    while (out.length % padding !== 0) out = '0' + out;
    if (this.negative !== 0) out = '-' + out;

    return out;
  };

  BN.prototype.toBaseString = function (base, padding) {
    let groupSize = groupSizes[base];
    let groupBase = groupBases[base];
    let c = this.clone();
    c.negative = 0;
    let out = '';

    while (!c.isZero()) {
      let r = c.modrn(groupBase).toString(base);
      c = c.idivn(groupBase);
      out = (!c.isZero())
        ? zeros[groupSize - r.length] + r + out
        : r + out;
    }

    if (this.isZero()) out = '0' + out;
    while (out.length % padding !== 0) out = '0' + out;
    if (this.negative !== 0) out = '-' + out;

    return out;
  };

  // Export module
  if (typeof module === 'object') module.exports = BN;
  else exports.BN = BN;

})(typeof module === 'undefined' || module, this);
