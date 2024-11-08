'use strict';

const hasNativeBigInts = () => {
    if (typeof BigInt === 'undefined') return false;

    const testValue = 42n; // using a BigInt literal here

    return typeof BigInt === 'function' && typeof testValue === 'bigint';
};

module.exports = hasNativeBigInts;
