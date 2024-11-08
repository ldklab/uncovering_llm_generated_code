'use strict';

const detectBigIntAvailability = () => {
  try {
    return typeof BigInt === 'function' && typeof BigInt(42) === 'bigint';
  } catch (e) {
    return false;
  }
};

module.exports = detectBigIntAvailability;
