markdown
// index.js
function flatPolyfill(array, depth = 1) {
  if (!Array.isArray(array)) {
    throw new TypeError('The first argument must be an array');
  }

  const flatten = (arr, d) => {
    return d > 0
      ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val, d - 1) : val), [])
      : arr.slice();
  };

  return flatten(array, depth);
}

function getPolyfill() {
  return typeof Array.prototype.flat === 'function' ? Array.prototype.flat : flatPolyfill;
}

function shim() {
  const polyfill = getPolyfill();
  if (Array.prototype.flat !== polyfill) {
    Object.defineProperty(Array.prototype, 'flat', {
      value: polyfill,
      configurable: true,
      writable: true,
    });
  }
  return polyfill;
}

module.exports = flatPolyfill;
module.exports.shim = shim;
module.exports.getPolyfill = getPolyfill;

// test.js
const assert = require('assert');
const flat = require('./index');

// Test cases
const arr = [1, [2], [], 3, [[4]]];

// Spec tests
assert.deepEqual(flat(arr, 1), [1, 2, 3, [4]]);
assert.deepEqual(flat(arr, 2), [1, 2, 3, 4]);

// Test shim
delete Array.prototype.flat;
const shimmedFlat = flat.shim();
assert.equal(shimmedFlat, flat.getPolyfill());
assert.deepEqual(arr.flat(), flat(arr));

// Test native compatibility
Array.prototype.flat = function (depth) {
  return flat(this, depth);
};
const shimmedIncludes = flat.shim();
assert.equal(shimmedIncludes, Array.prototype.flat);
assert.deepEqual(arr.flat(), flat(arr));

// Tests pass message
console.log("All tests passed!");
