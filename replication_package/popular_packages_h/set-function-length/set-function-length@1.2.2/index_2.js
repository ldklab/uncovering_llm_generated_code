'use strict';

const GetIntrinsic = require('get-intrinsic');
const defineProperty = require('define-data-property');
const hasPropertyDescriptors = require('has-property-descriptors')();
const getOwnPropertyDescriptor = require('gopd');

const TypeError = require('es-errors/type');
const floor = GetIntrinsic('%Math.floor%');

module.exports = function setFunctionLength(fn, length) {
    if (typeof fn !== 'function') {
        throw new TypeError('`fn` is not a function');
    }
    if (typeof length !== 'number' || length < 0 || length > 0xFFFFFFFF || floor(length) !== length) {
        throw new TypeError('`length` must be a positive 32-bit integer');
    }

    const loose = arguments.length > 2 && !!arguments[2];

    let lengthPropertyIsConfigurable = true;
    let lengthPropertyIsWritable = true;

    if ('length' in fn && getOwnPropertyDescriptor) {
        const descriptor = getOwnPropertyDescriptor(fn, 'length');
        if (descriptor && !descriptor.configurable) {
            lengthPropertyIsConfigurable = false;
        }
        if (descriptor && !descriptor.writable) {
            lengthPropertyIsWritable = false;
        }
    }

    if (lengthPropertyIsConfigurable || lengthPropertyIsWritable || !loose) {
        if (hasPropertyDescriptors) {
            defineProperty(fn, 'length', length, true, true);
        } else {
            defineProperty(fn, 'length', length);
        }
    }
    return fn;
};
