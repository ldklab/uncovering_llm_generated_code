// Function to check if a given value is a WeakMap
function isWeakMap(value) {
  // Check if the value is falsy or not of type 'object'
  if (!value || typeof value !== 'object') {
    return false;
  }
  // Try to use the has method of WeakMap to determine if the value is a WeakMap
  try {
    WeakMap.prototype.has.call(value);
    return true;
  } catch (e) {
    return false;
  }
}

// Export the function as a module
module.exports = isWeakMap;

// Import the assert module for testing
const assert = require('assert');

// Function to run a series of tests on the isWeakMap function
(function runTests() {
  // Assert various non-WeakMap values
  assert(!isWeakMap(function () {}), 'Function should not be a WeakMap');
  assert(!isWeakMap(null), 'null should not be a WeakMap');
  assert(!isWeakMap(function* () { yield 42; return Infinity; }), 'Generator function should not be a WeakMap');
  assert(!isWeakMap(Symbol('foo')), 'Symbol should not be a WeakMap');
  assert(!isWeakMap(1n), 'BigInt should not be a WeakMap');
  assert(!isWeakMap(Object(1n)), 'Object BigInt should not be a WeakMap');
  assert(!isWeakMap(new Set()), 'Set should not be a WeakMap');
  assert(!isWeakMap(new WeakSet()), 'WeakSet should not be a WeakMap');
  assert(!isWeakMap(new Map()), 'Map should not be a WeakMap');
  
  // Assert that a WeakMap is detected correctly
  assert(isWeakMap(new WeakMap()), 'WeakMap should be a WeakMap');

  // Assert a custom subclass of WeakMap
  class MyWeakMap extends WeakMap {}
  assert(isWeakMap(new MyWeakMap()), 'Instance of WeakMap subclass should be a WeakMap');

  // Log success message if all tests pass
  console.log("All tests passed!");
})();
