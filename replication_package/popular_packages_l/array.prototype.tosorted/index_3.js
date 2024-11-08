// array.prototype.tosorted.js

// Function that returns a sorted shallow copy of an array.
function toSorted(array, compareFn) {
    // Check if the provided value is an array.
    if (!Array.isArray(array)) {
        throw new TypeError('The provided value is not an Array');
    }
    // Create a shallow copy of the array.
    const copy = array.slice();
    // Sort the copy and return it.
    return copy.sort(compareFn);
}

// Function to get the polyfill for Array.prototype.toSorted
function getPolyfill() {
    // Return the native implementation if it exists, otherwise the custom toSorted function.
    return typeof Array.prototype.toSorted === 'function' ? Array.prototype.toSorted : toSorted;
}

// Function to add a shim for Array.prototype.toSorted
function shim() {
    // Check if toSorted is not a function on the prototype.
    if (typeof Array.prototype.toSorted !== 'function') {
        // If not, define toSorted on the prototype using the custom toSorted function.
        Array.prototype.toSorted = function(compareFn) {
            return toSorted(this, compareFn);
        };
    }
    // Return the toSorted function from the prototype.
    return Array.prototype.toSorted;
}

// Export the toSorted function, getPolyfill function, and shim function as a module.
module.exports = {
    toSorted: toSorted,
    getPolyfill: getPolyfill,
    shim: shim
};
