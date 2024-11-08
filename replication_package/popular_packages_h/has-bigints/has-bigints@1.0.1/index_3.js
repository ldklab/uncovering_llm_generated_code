'use strict';

module.exports = function hasNativeBigInts() {
    const isFunction = fn => typeof fn === 'function';
    const isBigIntType = val => typeof val === 'bigint';
  
    return isFunction(global.BigInt)
        && isFunction(BigInt)
        && isBigIntType(global.BigInt(42)) // eslint-disable-line no-magic-numbers
        && isBigIntType(BigInt(42)); // eslint-disable-line no-magic-numbers
};
