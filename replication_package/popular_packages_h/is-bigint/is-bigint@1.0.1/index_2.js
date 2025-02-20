'use strict';

function isBigInt(value) {
  if (typeof BigInt !== 'function') {
    return false;
  }
  
  const bigIntValueOf = BigInt.prototype.valueOf;

  function tryBigIntObject(value) {
    try {
      bigIntValueOf.call(value);
      return true;
    } catch (e) {
      return false;
    }
  }

  if (
    value === null ||
    typeof value === 'undefined' ||
    typeof value === 'boolean' ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'symbol' ||
    typeof value === 'function'
  ) {
    return false;
  }
  
  if (typeof value === 'bigint') {
    return true;
  }

  return tryBigIntObject(value);
}

module.exports = isBigInt;
