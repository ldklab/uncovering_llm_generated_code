// array.prototype.tosorted.js

// A function to create a sorted copy of an array
function toSorted(array, compareFn) {
    // Check if the input is an actual array
    if (!Array.isArray(array)) {
        throw new TypeError('The provided value is not an Array');
    }
    // Copy the array using slice, then sort the copy using the provided comparison function
    const copy = array.slice();
    return copy.sort(compareFn);
}

// A function to get the toSorted polyfill if it's not natively available
function getPolyfill() {
    // Return existing native method if available, otherwise return the custom implementation
    return typeof Array.prototype.toSorted === 'function' ? Array.prototype.toSorted : toSorted;
}

// A function to add (shim) toSorted to the Array prototype if it's not already present
function shim() {
    if (typeof Array.prototype.toSorted !== 'function') {
        Array.prototype.toSorted = function(compareFn) {
            return toSorted(this, compareFn);
        };
    }
    return Array.prototype.toSorted;
}

// Export the functions for external usage
module.exports = {
    toSorted: toSorted,
    getPolyfill: getPolyfill,
    shim: shim
};
