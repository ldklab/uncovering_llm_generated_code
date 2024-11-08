// GENERATED FILE. DO NOT EDIT.
(function(exports) {
  "use strict";
  
  // define as ES module if necessary
  if (typeof exports !== 'undefined') {
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
  } else {
    var exports = {};
  }
  
  var wasm = null; // Attempt to support WebAssembly optimizations
  try {
    wasm = new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([...]))).exports;
  } catch (e) {
    // WebAssembly not supported, proceed without it
  }

  function Long(low, high, unsigned = false) {
    this.low = low | 0;
    this.high = high | 0;
    this.unsigned = !!unsigned;
  }
  
  Long.prototype.__isLong__ = true;
  
  Long.isLong = function(obj) {
    return obj && obj.__isLong__;
  }
  
  Long.fromInt = function(value, unsigned = false) {
    return new Long(value | 0, (value < 0 ? -1 : 0) | 0, unsigned);
  }
  
  Long.fromBits = function(lowBits, highBits, unsigned = false) {
    return new Long(lowBits, highBits, unsigned);
  }

  Long.fromValue = function(val, unsigned) {
    if (typeof val === 'number') return Long.fromNumber(val, unsigned);
    if (typeof val === 'string') return Long.fromString(val, unsigned);
    return Long.fromBits(val.low, val.high, unsigned !== undefined ? unsigned : val.unsigned);
  }

  Long.fromNumber = function(value, unsigned = false) {
    // Handle specific ranges and convert number to Long
    if (isNaN(value)) return unsigned ? Long.UZERO : Long.ZERO;
    if (!unsigned) {
      if (value <= -Long.TWO_PWR_63) return Long.MIN_VALUE;
      if (value + 1 >= Long.TWO_PWR_63) return Long.MAX_VALUE;
    } else {
      if (value < 0) return Long.UZERO;
      if (value >= Long.TWO_PWR_64) return Long.MAX_UNSIGNED_VALUE;
    }
    return new Long(value | 0, (value / Long.TWO_PWR_32) | 0, unsigned);
  }

  Long.fromString = function(str, unsigned = false, radix = 10) {
    // Conversion from string representation
    if (str.length === 0) throw Error('empty string');
    const neg = str.startsWith('-');
    if (neg) str = str.substring(1);
    var result = Long.ZERO;
    const radixToPower = Long.fromNumber(Math.pow(radix, 8), unsigned);
    for (let i = 0; i < str.length; i += 8) {
      const size = Math.min(8, str.length - i);
      const value = parseInt(str.substring(i, i + size), radix);
      const addend = size < 8 
        ? Long.fromNumber(Math.pow(radix, size))
        : radixToPower;
      result = result.mul(addend).add(Long.fromNumber(value, unsigned));
    }
    result.unsigned = unsigned;
    return neg ? result.neg() : result;
  }

  Long.ZERO = Long.fromInt(0);
  Long.ONE = Long.fromInt(1);
  Long.NEG_ONE = Long.fromInt(-1);

  Long.MAX_VALUE = Long.fromBits(0xFFFFFFFF, 0x7FFFFFFF, false);
  Long.MAX_UNSIGNED_VALUE = Long.fromBits(0xFFFFFFFF, 0xFFFFFFFF, true);
  Long.MIN_VALUE = Long.fromBits(0, 0x80000000, false);

  Long.TWO_PWR_32 = 1 << 32;
  Long.TWO_PWR_64 = Long.TWO_PWR_32 * Long.TWO_PWR_32;
  Long.TWO_PWR_63 = Long.TWO_PWR_64 / 2;

  Long.UZERO = Long.fromBits(0, 0, true);

  Long.prototype.toInt = function() { return this.unsigned ? this.low >>> 0 : this.low; }
  Long.prototype.toNumber = function() { return this.unsigned ? (this.high >>> 0) * Long.TWO_PWR_32 + (this.low >>> 0) : this.high * Long.TWO_PWR_32 + this.low; }
  Long.prototype.toString = function(radix = 10) {
    radix = radix || 10;
    if (this.isZero()) return '0';
    if (this.isNegative()) {
      if (this.eq(Long.MIN_VALUE)) {
        const rem = this.div(radix).mul(radix).sub(this);
        return this.div(radix).toString(radix) + rem.toInt().toString(radix);
      }
      return '-' + this.neg().toString(radix);
    }
    var result = '';
    var rem = this;
    var radixToPower = Long.fromNumber(Math.pow(radix, 6), this.unsigned);
    while (true) {
      var remDiv = rem.div(radixToPower);
      var intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0;
      var digits = intval.toString(radix);
      rem = remDiv;
      if (rem.isZero()) return digits + result;
      while (digits.length < 6) digits = '0' + digits;
      result = digits + result;
    }
  };
  
  // Method definitions such as add, sub, mul, div, neg, isZero, eq, etc.
  
  exports.default = Long;
  if (typeof define === 'function' && define.amd) define([], function() { return Long; });
  else if (typeof module === 'object' && typeof exports === 'object') module.exports = Long;
})({});
