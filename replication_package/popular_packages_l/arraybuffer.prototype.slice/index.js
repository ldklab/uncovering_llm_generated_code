'use strict';

function toInteger(value) {
    var number = Number(value);
    if (isNaN(number)) {
        return 0;
    }
    if (number === 0 || !isFinite(number)) {
        return number;
    }
    return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
}

function toLength(value) {
    var len = toInteger(value);
    return Math.min(Math.max(len, 0), Number.MAX_SAFE_INTEGER);
}

function arrayBufferSlice(begin, end) {
    var buffer = this;
    if (!(buffer instanceof ArrayBuffer)) {
        throw new TypeError('ArrayBuffer.prototype.slice called on non-ArrayBuffer');
    }

    var len = buffer.byteLength;
    var relativeBegin = toInteger(begin);
    var first = relativeBegin < 0 ? Math.max(len + relativeBegin, 0) : Math.min(relativeBegin, len);

    var relativeEnd = end === undefined ? len : toInteger(end);
    var fin = relativeEnd < 0 ? Math.max(len + relativeEnd, 0) : Math.min(relativeEnd, len);

    var newLen = Math.max(fin - first, 0);
    var result = new ArrayBuffer(newLen);
    var sourceView = new Uint8Array(buffer, first, newLen);
    var targetView = new Uint8Array(result);
    targetView.set(sourceView);
    return result;
}

module.exports = function slice(input) {
    if (arguments.length !== 1) {
        throw new TypeError('This function takes exactly 1 argument');
    }
    return arrayBufferSlice.call(input);
};

module.exports.shim = function shimArrayBufferSlice() {
    if (typeof ArrayBuffer !== 'undefined' && !ArrayBuffer.prototype.slice) {
        ArrayBuffer.prototype.slice = arrayBufferSlice;
    }
};
