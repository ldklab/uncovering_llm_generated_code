'use strict';

const hasBigInts = require('has-bigints')();

let isBigInt;

if (hasBigInts) {
  const bigIntValueOf = BigInt.prototype.valueOf;
  
  const tryBigInt = (value) => {
    try {
      bigIntValueOf.call(value);
      return true;
    } catch (e) {
      return false;
    }
  };

  isBigInt = (value) => {
    if (value === null || typeof value === 'undefined' || typeof value === 'boolean' ||
        typeof value === 'string' || typeof value === 'number' || typeof value === 'symbol' ||
        typeof value === 'function') {
      return false;
    }
    if (typeof value === 'bigint') {
      return true;
    }
    return tryBigInt(value);
  };
} else {
  isBigInt = (value) => {
    return false;
  };
}

module.exports = isBigInt;
