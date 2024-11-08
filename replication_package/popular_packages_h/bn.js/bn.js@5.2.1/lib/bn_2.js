(function (module, exports) {
  'use strict';

  function assert(val, msg) {
    if (!val) throw new Error(msg || 'Assertion failed');
  }

  function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    function TempCtor() {}
    TempCtor.prototype = superCtor.prototype;
    ctor.prototype = new TempCtor();
    ctor.prototype.constructor = ctor;
  }

  function BN(number, base, endian) {
    if (BN.isBN(number)) {
      return number;
    }

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

  if (typeof module === 'object') {
    module.exports = BN;
  } else {
    exports.BN = BN;
  }

  BN.wordSize = 26;
  BN.BN = BN;

  BN.isBN = function isBN(num) {
    return num instanceof BN || (num !== null && typeof num === 'object' &&
      num.constructor.wordSize === BN.wordSize && Array.isArray(num.words));
  };

  BN.prototype._init = function init(number, base, endian) {
    if (typeof number === 'number') {
      return this._initNumber(number, base, endian);
    }
    if (typeof number === 'object') {
      return this._initArray(number, base, endian);
    }
    if (base === 'hex') base = 16;
    assert(base >= 2 && base <= 36);

    number = number.toString().replace(/\s+/g, '');
    var start = 0;
    if (number[0] === '-') {
      start++;
      this.negative = 1;
    }

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
  };

  BN.prototype._initNumber = function _initNumber(number, base, endian) {
    if (number < 0) {
      this.negative = 1;
      number = -number;
    }
    this.words = number < 0x4000000 ? [number & 0x3ffffff]
      : number < 0x10000000000000 ? [
          number & 0x3ffffff,
          (number / 0x4000000) & 0x3ffffff
        ] : [
          number & 0x3ffffff,
          (number / 0x4000000) & 0x3ffffff,
          1
        ];
    this.length = this.words.length;

    if (endian !== 'le') return;

    this._initArray(this.toArray(), base, endian);
  };

  BN.prototype._initArray = function _initArray(number, base, endian) {
    assert(typeof number.length === 'number');
    if (number.length <= 0) {
      this.words = [0];
      this.length = 1;
      return this;
    }

    this.length = Math.ceil(number.length / 3);
    this.words = new Array(this.length);
    for (var i = 0; i < this.length; i++) {
      this.words[i] = 0;
    }

    var j, w;
    var off = 0;
    if (endian === 'be') {
      for (i = number.length - 1, j = 0; i >= 0; i -= 3) {
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
      for (i = 0, j = 0; i < number.length; i += 3) {
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
  };

  // Additional methods for arithmetic operations, base conversions, etc.
  // ...

  BN.prototype.toArray = function toArray(endian, length) {
    return this.toArrayLike(Array, endian, length);
  };

  function allocate(ArrayType, size) {
    return ArrayType.allocUnsafe ? ArrayType.allocUnsafe(size) : new ArrayType(size);
  }

  BN.prototype.toArrayLike = function toArrayLike(ArrayType, endian, length) {
    this._strip();

    var byteLength = this.byteLength();
    var reqLength = length || Math.max(1, byteLength);
    assert(byteLength <= reqLength, 'byte array longer than desired length');
    assert(reqLength > 0, 'Requested array length <= 0');

    var res = allocate(ArrayType, reqLength);
    var postfix = endian === 'le' ? 'LE' : 'BE';
    this['_toArrayLike' + postfix](res, byteLength);
    return res;
  };

  // Methods for different endian representations
  // ...

  BN.prototype.cmpn = function cmpn(num) {
    var negative = num < 0;

    if (this.negative !== 0 && !negative) return -1;
    if (this.negative === 0 && negative) return 1;

    this._strip();

    if (this.length > 1) {
      return 1;
    } else {
      if (negative) num = -num;
      assert(num <= 0x3ffffff, 'Number is too big');
      var w = this.words[0] | 0;
      return w === num ? 0 : w < num ? -1 : 1;
    }
  };

  // Additional methods for comparison, bitwise operations, negations
  // ...

})(typeof module === 'undefined' || module, this);
