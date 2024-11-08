// The module is designed to provide a polyfill for the `Array.prototype.toSorted` method.
// This method, if not available, is created to return a new array that is a sorted version of the original array,
// without modifying the original array itself.

function toSorted(array, compareFn) {
    // Ensure the input is an array
    if (!Array.isArray(array)) {
        throw new TypeError('The provided value is not an Array');
    }
    // Create a shallow copy of the array and sort it using the specified compare function
    const copy = array.slice();
    return copy.sort(compareFn);
}

function getPolyfill() {
    // Check if the `toSorted` method is already a function on the prototype
    // If it exists, return it; otherwise, provide the custom `toSorted` implementation
    return typeof Array.prototype.toSorted === 'function' ? Array.prototype.toSorted : toSorted;
}

function shim() {
    // Ensure that `Array.prototype.toSorted` is defined if it isn't already
    // Attach our custom `toSorted` method to the prototype
    if (typeof Array.prototype.toSorted !== 'function') {
        Array.prototype.toSorted = function(compareFn) {
            return toSorted(this, compareFn);
        };
    }
    // Return the potentially polyfilled method from the prototype
    return Array.prototype.toSorted;
}

module.exports = {
    toSorted: toSorted,
    getPolyfill: getPolyfill,
    shim: shim
};
