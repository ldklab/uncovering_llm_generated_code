'use strict';

const $TypeError = require('es-errors/type');
const callBound = require('call-bind/callBound');
const isTypedArray = require('is-typed-array');

const $typedArrayBuffer = callBound('TypedArray.prototype.buffer', true);

module.exports = $typedArrayBuffer || function typedArrayBuffer(x) {
    if (!isTypedArray(x)) {
        throw new $TypeError('Not a Typed Array');
    }
    return x.buffer;
};
