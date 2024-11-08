;(function (globalObject) {
  'use strict';

  function BigNumber(v) {
    if (!(this instanceof BigNumber)) return new BigNumber(v);
    this.value = parseInput(v);
  }

  BigNumber.prototype.toString = function () {
    return this.value.toString();
  };

  BigNumber.prototype.plus = function (other) {
    other = new BigNumber(other);
    return new BigNumber(this.value + other.value);
  };

  BigNumber.prototype.minus = function (other) {
    other = new BigNumber(other);
    return new BigNumber(this.value - other.value);
  };

  BigNumber.prototype.times = function (other) {
    other = new BigNumber(other);
    return new BigNumber(this.value * other.value);
  };

  BigNumber.prototype.dividedBy = function (other) {
    other = new BigNumber(other);
    if (other.value === 0) throw new Error('Division by zero');
    return new BigNumber(this.value / other.value);
  };

  BigNumber.prototype.isEqualTo = function (other) {
    other = new BigNumber(other);
    return this.value === other.value;
  };

  function parseInput(v) {
    if (typeof v === 'number') return +v;
    if (typeof v === 'string') return parseFloat(v);
    if (v instanceof BigNumber) return +v.value;
    throw new Error('Invalid input');
  }

  if (typeof define === 'function' && define.amd) {
    define(function () { return BigNumber; });
  } else if (typeof module != 'undefined' && module.exports) {
    module.exports = BigNumber;
  } else {
    if (!globalObject) {
      globalObject = typeof self !== 'undefined' && self ? self : window;
    }
    globalObject.BigNumber = BigNumber;
  }
})(this);
