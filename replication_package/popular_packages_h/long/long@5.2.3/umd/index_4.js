// Generates a module for handling 64-bit two's-complement integers, `Long`.

(function(root, factory) {
  if (typeof define === 'function' && define.amd)
    define([], factory);
  else if (typeof module === 'object' && typeof exports === 'object')
    module.exports = factory();
  else
    root.Long = factory();
}(this, function() {
  "use strict";

  // Initialize WebAssembly module if supported
  var wasm;
  try {
    wasm = new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([/* Precompiled binary data */])), {}).exports;
  } catch (e) {
    wasm = null; // If no WebAssembly, fall back to JavaScript calculations
  }

  // Helper functions
  function isLong(obj) {
    return obj && obj.__isLong__ === true;
  }
  function ctz32(value) {
    var c = Math.clz32(value & -value);
    return value ? 31 - c : c;
  }

  // Long class definition
  function Long(low, high, unsigned) {
    this.low = low | 0;
    this.high = high | 0;
    this.unsigned = !!unsigned;
  }

  // Attach identifier to Long prototype
  Long.prototype.__isLong__ = true;

  // Long factory methods
  Long.fromInt = function(value, unsigned) {
    // Check cached value or create new Long
    var cache = unsigned ? UINT_CACHE : INT_CACHE;
    if (value < 0 || value >= (unsigned ? 256 : 128) || (cache[value] !== undefined))
      return cache[value] || (cache[value] = new Long(value, unsigned ? 0 : (value < 0 ? -1 : 0), unsigned));
    return new Long(value | 0, 0, unsigned);
  };

  Long.fromNumber = function(value, unsigned) {
    if (isNaN(value) || !isFinite(value)) return unsigned ? Long.UZERO : Long.ZERO;
    if (unsigned) {
      if (value < 0) return Long.UZERO;
      if (value >= Long.MAX_UNSIGNED_VALUE.toNumber()) return Long.MAX_UNSIGNED_VALUE;
    } else {
      if (value <= Long.MIN_VALUE.toNumber()) return Long.MIN_VALUE;
      if (value >= Long.MAX_VALUE.toNumber()) return Long.MAX_VALUE;
    }
    return new Long(value | 0, (value / 0x100000000) | 0, unsigned);
  };

  Long.fromBits = function(lowBits, highBits, unsigned) {
    return new Long(lowBits, highBits, unsigned);
  };

  Long.fromString = function(str, unsigned, radix) {
    if (typeof unsigned === 'number') [radix, unsigned] = [unsigned, false];
    unsigned = !!unsigned;
    var value = parseInt(str, radix || 10);
    return Long.fromNumber(value, unsigned);
  };

  // Long constants
  var TWO_PWR_16 = 1 << 16;
  var ZERO = Long.fromInt(0);
  var UZERO = Long.fromInt(0, true);
  var ONE = Long.fromInt(1);
  var UONE = Long.fromInt(1, true);

  // Attach common constants
  Long.ZERO = ZERO;
  Long.UZERO = UZERO;
  Long.ONE = ONE;
  Long.UONE = UONE;
  Long.MIN_VALUE = Long.fromBits(0, 0x80000000 | 0, false);
  Long.MAX_VALUE = Long.fromBits(-1, 0x7FFFFFFF | 0, false);
  Long.MAX_UNSIGNED_VALUE = Long.fromBits(-1, -1, true);

  // Arithmetic and logical operations
  Long.prototype.toInt = function() {
    return this.unsigned ? this.low >>> 0 : this.low;
  };
  Long.prototype.toNumber = function() {
    return ((this.high >>> 0) * 0x100000000) + (this.low >>> 0);
  };
  Long.prototype.toString = function(radix) {
    var valueString = this.toNumber().toString(radix || 10);
    return this.isNegative() ? '-' + valueString : valueString;
  };
  Long.prototype.isZero = function() {
    return this.low === 0 && this.high === 0;
  };
  Long.prototype.isNegative = function() {
    return !this.unsigned && this.high < 0;
  };
  Long.prototype.add = function(other) {
    other = isLong(other) ? other : Long.fromValue(other);
    return new Long(this.low + other.low, this.high + other.high, this.unsigned);
  };
  Long.prototype.subtract = function(other) {
    other = isLong(other) ? other : Long.fromValue(other);
    return this.add(other.negate());
  };
  Long.prototype.multiply = function(multiplier) {
    if (wasm) {
      // If WebAssembly is available
      var low = wasm.mul(this.low, this.high, multiplier.low, multiplier.high);
      return new Long(low, wasm.get_high(), this.unsigned);
    }
    // Fallback JavaScript implementation
    var a = ((this.high >>> 16) * multiplier.low + (this.low & 0xFFFF) * multiplier.high >>> 16) & 0xFFFF;
    var b = (((this.low >>> 16) * multiplier.low) & 0xFFFF) + (multiplier.low & 0xFFFF) * a;
    var low = this.low * multiplier.low + (b << 16);
    var high = this.high * multiplier.low + this.low * multiplier.high + b & 0xFFFF0000;
    return new Long(low, high, this.unsigned);
  };
  Long.prototype.negate = function() {
    if (!this.unsigned && this.eq(Long.MIN_VALUE)) return Long.MIN_VALUE;
    return this.not().add(Long.ONE);
  };
  Long.prototype.not = function() {
    return new Long(~this.low, ~this.high, this.unsigned);
  };
  // Bitwise and shift operations
  Long.prototype.and = function(other) {
    if (!isLong(other)) other = Long.fromValue(other);
    return new Long(this.low & other.low, this.high & other.high, this.unsigned);
  };
  Long.prototype.or = function(other) {
    if (!isLong(other)) other = Long.fromValue(other);
    return new Long(this.low | other.low, this.high | other.high, this.unsigned);
  };
  Long.prototype.xor = function(other) {
    if (!isLong(other)) other = Long.fromValue(other);
    return new Long(this.low ^ other.low, this.high ^ other.high, this.unsigned);
  };
  Long.prototype.shiftLeft = function(numBits) {
    numBits &= 63;
    if (numBits === 0) return this;
    if (numBits < 32)
      return new Long((this.low << numBits), (this.high << numBits) | (this.low >>> (32 - numBits)), this.unsigned);
    return new Long(0, this.low << (numBits - 32), this.unsigned);
  };
  Long.prototype.shiftRight = function(numBits) {
    numBits &= 63;
    if (numBits === 0) return this;
    if (numBits < 32)
      return new Long((this.low >>> numBits) | (this.high << (32 - numBits)), (this.high >> numBits), this.unsigned);
    return new Long(this.high >> (numBits - 32), (this.high >= 0) ? 0 : -1, this.unsigned);
  };
  Long.prototype.shiftRightUnsigned = function(numBits) {
    numBits &= 63;
    if (numBits === 0) return this;
    var low, high;
    if (numBits < 32) {
      low = (this.low >>> numBits) | (this.high << (32 - numBits));
      high = this.high >>> numBits;
    } else if (numBits === 32) {
      low = this.high;
      high = 0;
    } else {
      low = this.high >>> (numBits - 32);
      high = 0;
    }
    return new Long(low, high, this.unsigned);
  };
  Long.fromValue = function(val, unsigned) {
    if (typeof val === 'number') return Long.fromNumber(val, unsigned);
    if (typeof val === 'string') return Long.fromString(val, unsigned);
    return Long.fromBits(val.low, val.high, unsigned !== undefined ? unsigned : val.unsigned);
  };
  return Long;
}));
