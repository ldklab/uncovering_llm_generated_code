// This function checks if the given value is a WeakMap
function isWeakMap(value) {
  // Check if the value is not truthy or not an object, return false immediately
  if (!value || typeof value !== 'object') {
    return false;
  }
  try {
    // Try to use WeakMap's 'has' method; success indicates that value is a WeakMap
    WeakMap.prototype.has.call(value);
    return true;
  } catch (e) {
    // If an error is thrown, value is not a WeakMap
    return false;
  }
}

module.exports = isWeakMap;

// Tests for isWeakMap function
const assert = require('assert');

(function runTests() {
  // Different types of checks ensuring the correctness of isWeakMap functionality
  assert(!isWeakMap(function () {}), 'Function should not be a WeakMap');
  assert(!isWeakMap(null), 'null should not be a WeakMap');
  assert(!isWeakMap(function* () { yield 42; return Infinity; }), 'Generator function should not be a WeakMap');
  assert(!isWeakMap(Symbol('foo')), 'Symbol should not be a WeakMap');
  assert(!isWeakMap(1n), 'BigInt should not be a WeakMap');
  assert(!isWeakMap(Object(1n)), 'Object BigInt should not be a WeakMap');
  assert(!isWeakMap(new Set()), 'Set should not be a WeakMap');
  assert(!isWeakMap(new WeakSet()), 'WeakSet should not be a WeakMap');
  assert(!isWeakMap(new Map()), 'Map should not be a WeakMap');

  // Positive test cases for actual WeakMaps
  assert(isWeakMap(new WeakMap()), 'WeakMap should be a WeakMap');

  // Test for subclass of WeakMap
  class MyWeakMap extends WeakMap {}
  assert(isWeakMap(new MyWeakMap()), 'Instance of WeakMap subclass should be a WeakMap');

  console.log("All tests passed!");
})();
