// index.js
function flatPolyfill(array, depth = 1) {
  // Check if the input is an array, if not, throw an error
  if (!Array.isArray(array)) {
    throw new TypeError('The first argument must be an array');
  }

  // Recursive function to flatten the array up to the specified depth
  const flatten = (arr, d) => {
    // If depth is greater than 0, reduce the array and flatten it
    return d > 0
      ? arr.reduce((acc, val) => 
        acc.concat(Array.isArray(val) ? flatten(val, d - 1) : val), [])
      : arr.slice(); // If depth is 0, return a shallow copy
  };

  // Return the flattened array
  return flatten(array, depth);
}

function getPolyfill() {
  // Return the native flat method if it exists, otherwise return the polyfill
  return typeof Array.prototype.flat === 'function' ? Array.prototype.flat : flatPolyfill;
}

function shim() {
  const polyfill = getPolyfill();
  // If the Array prototype does not have flat defined or is different, define it
  if (Array.prototype.flat !== polyfill) {
    Object.defineProperty(Array.prototype, 'flat', {
      value: polyfill,
      configurable: true,
      writable: true,
    });
  }
  return polyfill; // Return the flat polyfill or native method
}

// Export the flatPolyfill, shim, and getPolyfill functions
module.exports = flatPolyfill;
module.exports.shim = shim;
module.exports.getPolyfill = getPolyfill;

// test.js
const assert = require('assert');
const flat = require('./index');

// Test cases
const arr = [1, [2], [], 3, [[4]]];

// Verify functionality with different depths
assert.deepEqual(flat(arr, 1), [1, 2, 3, [4]]);
assert.deepEqual(flat(arr, 2), [1, 2, 3, 4]);

// Test if shim correctly adds polyfill
delete Array.prototype.flat;
const shimmedFlat = flat.shim();
assert.equal(shimmedFlat, flat.getPolyfill());
assert.deepEqual(arr.flat(), flat(arr));

// Test compatibility with the native method
Array.prototype.flat = function (depth) {
  return flat(this, depth);
};
const shimmedIncludes = flat.shim();
assert.equal(shimmedIncludes, Array.prototype.flat);
assert.deepEqual(arr.flat(), flat(arr));

// Confirm all tests passed
console.log("All tests passed!");
