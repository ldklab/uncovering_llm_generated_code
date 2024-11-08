const assert = (val, msg) => {
  if (!val) throw new Error(msg || 'Assertion failed');
};

// Inheritance utility function
const inherits = (ctor, superCtor) => {
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype);
  ctor.prototype.constructor = ctor;
};

class BN {
  constructor(number, base, endian) {
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
    return num instanceof BN || (typeof num === 'object' && num.constructor.wordSize === BN.wordSize && Array.isArray(num.words));
  }

  _init(number, base, endian) {
    // Check the type of the number and initialize accordingly
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

    if (endian === 'le') {
      this._initArray(this.toArray(), base, endian);
    }

    return this._strip();
  }

  _initNumber(number, base, endian) {
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
        (number / 0x4000000) & 0x3ffffff,
      ];
      this.length = 2;
    } else {
      assert(number < 0x20000000000000); // 2^53 (safe limit)
      this.words = [
        number & 0x3ffffff,
        (number / 0x4000000) & 0x3ffffff,
        1,
      ];
      this.length = 3;
    }

    if (endian === 'le') {
      this._initArray(this.toArray(), base, endian);
    }
    return this;
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

    let j, w, off = 0;
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

  _strip() {
    while (this.length > 1 && this.words[this.length - 1] === 0) {
      this.length--;
    }
    return this;
  }

  // More methods like add, subtract, multiply would be here...
}

BN.BN = BN;
BN.wordSize = 26;

module.exports = BN;
