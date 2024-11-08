'use strict';

// Convert a value to an integer, returning reasonable defaults for non-numeric values.
function toInteger(value) {
    var number = Number(value);
    if (isNaN(number)) {
        return 0;  // Return 0 if the value cannot be converted to a number.
    }
    if (number === 0 || !isFinite(number)) {
        return number;  // Return the number if it's 0 or an infinity value.
    }
    // Return the integer conversion of the absolute value with sign preservation.
    return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
}

// Convert a value to a length within the safe integer range.
function toLength(value) {
    var len = toInteger(value);
    // Ensure the length is within the bounds of 0 and the maximum safe integer.
    return Math.min(Math.max(len, 0), Number.MAX_SAFE_INTEGER);
}

// Slices an ArrayBuffer similar to how Array.prototype.slice works for arrays.
function arrayBufferSlice(begin, end) {
    var buffer = this;
    // Ensure the context is an ArrayBuffer.
    if (!(buffer instanceof ArrayBuffer)) {
        throw new TypeError('ArrayBuffer.prototype.slice called on non-ArrayBuffer');
    }

    var len = buffer.byteLength;  // Get the byte length of the buffer.
    var relativeBegin = toInteger(begin);  // Convert `begin` to an integer.
    var first = relativeBegin < 0 ? Math.max(len + relativeBegin, 0) : Math.min(relativeBegin, len);

    var relativeEnd = end === undefined ? len : toInteger(end);  // Convert `end` to an integer.
    var fin = relativeEnd < 0 ? Math.max(len + relativeEnd, 0) : Math.min(relativeEnd, len);

    var newLen = Math.max(fin - first, 0);  // Determine new length.
    var result = new ArrayBuffer(newLen);  // Create new ArrayBuffer of the calculated length.
    var sourceView = new Uint8Array(buffer, first, newLen);  // View source from `first` to `newLen`.
    var targetView = new Uint8Array(result);  // View destination.
    targetView.set(sourceView);  // Copy data to the new buffer.
    return result;  // Return the new sliced buffer.
}

// Export a function that slices an ArrayBuffer-like input.
module.exports = function slice(input) {
    if (arguments.length !== 1) {
        throw new TypeError('This function takes exactly 1 argument');
    }
    return arrayBufferSlice.call(input);  // Utilize the `arrayBufferSlice` with `call`.
};

// Shim function to add arrayBufferSlice to ArrayBuffer prototype if not available.
module.exports.shim = function shimArrayBufferSlice() {
    if (typeof ArrayBuffer !== 'undefined' && !ArrayBuffer.prototype.slice) {
        ArrayBuffer.prototype.slice = arrayBufferSlice;  // Add slice to prototype if missing.
    }
};
