'use strict';

const hasNativeBigInts = () => {
    try {
        const $BigInt = BigInt;
        return typeof $BigInt === 'function'
            && typeof BigInt === 'function'
            && typeof $BigInt(42) === 'bigint'
            && typeof BigInt(42) === 'bigint';
    } catch (e) {
        return false;
    }
};

module.exports = hasNativeBigInts;
