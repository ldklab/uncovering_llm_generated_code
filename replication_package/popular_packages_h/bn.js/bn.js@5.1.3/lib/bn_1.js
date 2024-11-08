(function (module, exports) {
  'use strict';

  class BN {
    constructor(number, base = 10, endian = 'be') {
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
        this._init(number || 0, base, endian);
      }
    }

    static isBN(num) {
      return num instanceof BN ||
             (num !== null && typeof num === 'object' &&
              num.constructor.wordSize === BN.wordSize && Array.isArray(num.words));
    }

    static max(left, right) {
      return left.cmp(right) > 0 ? left : right;
    }

    static min(left, right) {
      return left.cmp(right) < 0 ? left : right;
    }

    _init(number, base, endian) {
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
      const start = number[0] === '-' ? 1 : 0;

      if (base === 16) {
        this._parseHex(number, start);
      } else {
        this._parseBase(number, base, start);
      }

      if (number[0] === '-') {
        this.negative = 1;
      }

      this._strip();

      if (endian === 'le') {
        this._initArray(this.toArray(), base, endian);
      }
    }

    // Other prototype methods for various arithmetic operations and conversion will go here

    static mont(num) {
      return new Mont(num);
    }
  }

  // Other utility functions like `assert`, `inherits`, and various prototype methods of BN will go here 

  if (typeof module === 'object') {
    module.exports = BN;
  } else {
    exports.BN = BN;
  }

  // Avoid duplicating large arrays of zeros and group sizes/bases
  const zeros = ['', '0', '00', '000', /* More zeros */];
  const groupSizes = [0, 0, /* More sizes */];
  const groupBases = [0, 0, /* More bases */];

  // The rest of the methods for arithmetic operations continue...

})(typeof module === 'undefined' || module, this);
