'use strict';

// Converts a given value to an integer
function toInteger(value) {
    var number = Number(value);
    if (isNaN(number)) {
        return 0; // Return 0 for NaN values
    }
    if (number === 0 || !isFinite(number)) {
        return number; // Return the number if it's 0 or not finite
    }
    // Convert the number to an integer by taking the absolute value, flooring it, 
    // and adjusting the sign by multiplying with positive or negative 1
    return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
}

// Restricts a given value to a valid array length
function toLength(value) {
    var len = toInteger(value);
    // Restrict the length between 0 and the maximum safe integer value
    return Math.min(Math.max(len, 0), Number.MAX_SAFE_INTEGER);
}

// Simulates the ArrayBuffer.prototype.slice method
function arrayBufferSlice(begin, end) {
    var buffer = this;
    // Check if the context is an ArrayBuffer
    if (!(buffer instanceof ArrayBuffer)) {
        throw new TypeError('ArrayBuffer.prototype.slice called on non-ArrayBuffer');
    }

    var len = buffer.byteLength;
    // Calculate the "begin" index, considering negative indexes
    var relativeBegin = toInteger(begin);
    var first = relativeBegin < 0 ? Math.max(len + relativeBegin, 0) : Math.min(relativeBegin, len);

    // Calculate the "end" index, considering negative indexes
    var relativeEnd = end === undefined ? len : toInteger(end);
    var fin = relativeEnd < 0 ? Math.max(len + relativeEnd, 0) : Math.min(relativeEnd, len);

    // Determine the new length of the sliced portion
    var newLen = Math.max(fin - first, 0);
    // Create a new ArrayBuffer to contain the sliced data
    var result = new ArrayBuffer(newLen);
    // Create views for the source and target buffers
    var sourceView = new Uint8Array(buffer, first, newLen);
    var targetView = new Uint8Array(result);
    // Copy the data from the source view to the target view
    targetView.set(sourceView);
    return result;
}

// Export a function that utilizes the arrayBufferSlice function
module.exports = function slice(input) {
    if (arguments.length !== 1) {
        throw new TypeError('This function takes exactly 1 argument');
    }
    return arrayBufferSlice.call(input);
};

// Shim method to add the slice function to ArrayBuffer's prototype if not present
module.exports.shim = function shimArrayBufferSlice() {
    if (typeof ArrayBuffer !== 'undefined' && !ArrayBuffer.prototype.slice) {
        ArrayBuffer.prototype.slice = arrayBufferSlice;
    }
};
