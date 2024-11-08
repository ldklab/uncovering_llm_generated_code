// Function to check if a value is a WeakMap
function isWeakMap(value) {
  // Return false if the value is not an object
  if (!value || typeof value !== 'object') {
    return false;
  }
  try {
    // Try to call the 'has' method from WeakMap's prototype on the value
    WeakMap.prototype.has.call(value);
    return true; // If successful, it is a WeakMap
  } catch (e) {
    return false; // If an error occurs, it is not a WeakMap
  }
}

// Export the function for use in other files
module.exports = isWeakMap;

// Import the assert module for testing
const assert = require('assert');

// Function that runs a series of tests to verify isWeakMap functionality
(function runTests() {
  // Test various non-WeakMap values to ensure they return false
  assert(!isWeakMap(function () {}), 'Function should not be a WeakMap');
  assert(!isWeakMap(null), 'null should not be a WeakMap');
  assert(!isWeakMap(function* () { yield 42; return Infinity; }), 'Generator function should not be a WeakMap');
  assert(!isWeakMap(Symbol('foo')), 'Symbol should not be a WeakMap');
  assert(!isWeakMap(1n), 'BigInt should not be a WeakMap');
  assert(!isWeakMap(Object(1n)), 'Object BigInt should not be a WeakMap');
  assert(!isWeakMap(new Set()), 'Set should not be a WeakMap');
  assert(!isWeakMap(new WeakSet()), 'WeakSet should not be a WeakMap');
  assert(!isWeakMap(new Map()), 'Map should not be a WeakMap');

  // Test actual WeakMap instances to ensure they return true
  assert(isWeakMap(new WeakMap()), 'WeakMap should be a WeakMap');

  // Test subclass instances of WeakMap to ensure they also return true
  class MyWeakMap extends WeakMap {}
  assert(isWeakMap(new MyWeakMap()), 'Instance of WeakMap subclass should be a WeakMap');

  // Log success message if all tests pass
  console.log("All tests passed!");
})();
