'use strict';

// Converts a value to an integer, handles edge-cases like NaN, Infinity, and negative numbers.
function toInteger(value) {
    let number = Number(value);
    if (isNaN(number)) {
        return 0;
    }
    if (number === 0 || !isFinite(number)) {
        return number;
    }
    return Math.sign(number) * Math.floor(Math.abs(number));
}

// Converts a value to a valid array length within allowed limits.
function toLength(value) {
    let len = toInteger(value);
    return Math.min(Math.max(len, 0), Number.MAX_SAFE_INTEGER);
}

// A custom implementation of `ArrayBuffer.prototype.slice`.
function arrayBufferSlice(begin, end) {
    let buffer = this;

    // Ensure `this` is an ArrayBuffer.
    if (!(buffer instanceof ArrayBuffer)) {
        throw new TypeError('ArrayBuffer.prototype.slice called on non-ArrayBuffer');
    }

    let len = buffer.byteLength;
    let relativeBegin = toInteger(begin);
    let first = relativeBegin < 0 ? Math.max(len + relativeBegin, 0) : Math.min(relativeBegin, len);

    let relativeEnd = end === undefined ? len : toInteger(end);
    let fin = relativeEnd < 0 ? Math.max(len + relativeEnd, 0) : Math.min(relativeEnd, len);

    let newLen = Math.max(fin - first, 0);
    let result = new ArrayBuffer(newLen);
    let sourceView = new Uint8Array(buffer, first, newLen);
    let targetView = new Uint8Array(result);
    targetView.set(sourceView);
    return result;
}

// Main export function to slice an ArrayBuffer.
module.exports = function slice(input) {
    if (arguments.length !== 1) {
        throw new TypeError('This function takes exactly 1 argument');
    }
    return arrayBufferSlice.call(input);
};

// A shim function to add the custom slice method to ArrayBuffer prototype if it's not already there.
module.exports.shim = function shimArrayBufferSlice() {
    if (typeof ArrayBuffer !== 'undefined' && !ArrayBuffer.prototype.slice) {
        ArrayBuffer.prototype.slice = arrayBufferSlice;
    }
};
