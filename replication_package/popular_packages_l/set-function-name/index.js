'use strict';

function setFunctionName(fn, name, loose = false) {
    if (typeof fn !== 'function') {
        throw new TypeError('First argument must be a function');
    }
    if (typeof name !== 'string') {
        throw new TypeError('Second argument must be a string');
    }

    try {
        Object.defineProperty(fn, 'name', { value: name, configurable: true });
    } catch (e) {
        if (!loose) {
            throw e;
        }
    }

    return fn;
}

module.exports = setFunctionName;
