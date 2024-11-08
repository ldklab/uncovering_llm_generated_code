'use strict';

// Implementation of a simple assert function
function assert(val, msg) {
  if (!val) throw new Error(msg || 'Assertion failed');
}

// Simplified inheritance function (mimicking util.inherits)
function inherits(ctor, superCtor) {
  ctor.super_ = superCtor;
  function TempCtor() {}
  TempCtor.prototype = superCtor.prototype;
  ctor.prototype = new TempCtor();
  ctor.prototype.constructor = ctor;
}

// Node module or global export check
let Buffer;
try {
  Buffer = require('buffer').Buffer;
} catch (e) {}

// Big Number class implementation
class BN {
  constructor(number, base, endian) {
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
  
  static isBN(num) {
    if (num instanceof BN) {
      return true;
    }
    return num !== null && typeof num === 'object' &&
           num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
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
    if (base === 'hex') base = 16;
    assert(base === (base | 0) && base >= 2 && base <= 36);

    number = number.toString().replace(/\s+/g, '');
    var start = 0;
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
      for (var i = number.length - 1, j = 0; i >= 0; i -= 3) {
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
      for (var i = 0, j = 0; i < number.length; i += 3) {
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
  
  toString(base = 10, padding = 1) {
    let out;
    if (base === 16 || base === 'hex') {
      out = '';
      let off = 0;
      let carry = 0;
      for (let i = 0; i < this.length; i++) {
        let w = this.words[i];
        let word = (((w << off) | carry) & 0xffffff).toString(16);
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
        let r = c.modrn(groupBase).toString(base);
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
  }

  // ... (rest of methods remain similar, implementing the same logic)

}

// Export the BN class based on the environment
if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = BN;
} else {
  exports.BN = BN;
}
