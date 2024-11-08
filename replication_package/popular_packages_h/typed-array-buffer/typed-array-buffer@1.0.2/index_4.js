'use strict';

const $TypeError = require('es-errors/type');
const callBound = require('call-bind/callBound');
const isTypedArray = require('is-typed-array');

// Attempt to access the buffer property directly for TypedArray
const $typedArrayBuffer = callBound('TypedArray.prototype.buffer', true);

function typedArrayBufferFallback(x) {
    if (!isTypedArray(x)) {
        throw new $TypeError('Not a Typed Array');
    }
    return x.buffer;
}

// Export the buffer accessor function
module.exports = $typedArrayBuffer || typedArrayBufferFallback;
