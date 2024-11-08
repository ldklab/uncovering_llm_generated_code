// array.prototype.tosorted.js
function toSorted(array, compareFn) {
    if (!Array.isArray(array)) {
        throw new TypeError('The provided value is not an Array');
    }
    const copy = array.slice(); // Create a shallow copy of the array
    return copy.sort(compareFn); // Sort the copy and return it
}

function getPolyfill() {
    return typeof Array.prototype.toSorted === 'function' ? Array.prototype.toSorted : toSorted;
}

function shim() {
    if (typeof Array.prototype.toSorted !== 'function') {
        Array.prototype.toSorted = function(compareFn) {
            return toSorted(this, compareFn);
        };
    }
    return Array.prototype.toSorted;
}

module.exports = {
    toSorted: toSorted,
    getPolyfill: getPolyfill,
    shim: shim
};
