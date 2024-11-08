'use strict';

function setFunctionLength(fn, length, loose = false) {
    if (typeof fn !== 'function') {
        throw new TypeError('First argument must be a function');
    }
    if (!Number.isInteger(length) || length < 0 || length >= 2 ** 32) {
        throw new RangeError('Length must be an integer between 0 and 2**32');
    }

    try {
        Object.defineProperty(fn, 'length', {
            value: length,
            writable: false,
            enumerable: false,
            configurable: true
        });
    } catch (error) {
        if (!loose) {
            throw error;
        }
    }

    return fn;
}

module.exports = setFunctionLength;
