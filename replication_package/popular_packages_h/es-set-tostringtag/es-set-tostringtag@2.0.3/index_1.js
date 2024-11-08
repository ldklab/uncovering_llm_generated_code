'use strict';

const GetIntrinsic = require('get-intrinsic');

const defineProperty = GetIntrinsic('%Object.defineProperty%', true);

const supportsToStringTag = require('has-tostringtag/shams')();
const hasOwn = require('hasown');

const toStringTagSymbol = supportsToStringTag ? Symbol.toStringTag : null;

module.exports = function setToStringTag(object, value, options = {}) {
    const { force } = options;
    if (toStringTagSymbol && (force || !hasOwn(object, toStringTagSymbol))) {
        if (defineProperty) {
            defineProperty(object, toStringTagSymbol, {
                configurable: true,
                enumerable: false,
                value: value,
                writable: false
            });
        } else {
            object[toStringTagSymbol] = value; // Direct assignment if unable to define property
        }
    }
};
