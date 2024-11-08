// This Node.js code is a utility that checks if a given value is callable. 
// It exports a function `isCallable` that returns a boolean indicating whether the value is a function or not.

// `isCallable/index.js`

'use strict';

function isCallable(value) {
  if (value == null) {
    return false; // Null or undefined values are not callable.
  }
  if (typeof value === 'function') {
    return true; // Simple check if the value is a function.
  }

  // For ES6+ environments, checking for functions defined with certain syntax
  if (typeof value === 'object' && typeof Symbol !== 'undefined' && typeof Symbol.toStringTag === 'symbol') {
    try {
      const fnToString = Function.prototype.toString;
      const valueString = fnToString.call(value);
      
      // Return false for generator functions and classes
      if (/^\s*function\s*\*/.test(valueString) || /^\s*class\b/.test(valueString)) {
        return false;
      }

      return /^\s*(function|class)\s*/.test(valueString); // Check if it's a regular function
    } catch (e) {
      return false; // In case of an error, we assume it's not callable
    }
  }
  return false; // For all other cases (non-functional objects)
}

module.exports = isCallable;

// `is-callable/test/test.js`

'use strict';

const assert = require('assert');
const isCallable = require('../index');

// Testing isCallable function with various inputs to verify its correctness
try {
  // Non-callable values
  assert.strictEqual(isCallable(undefined), false);
  assert.strictEqual(isCallable(null), false);
  assert.strictEqual(isCallable(false), false);
  assert.strictEqual(isCallable(true), false);
  assert.strictEqual(isCallable([]), false);
  assert.strictEqual(isCallable({}), false);
  assert.strictEqual(isCallable(/a/g), false);
  assert.strictEqual(isCallable(new RegExp('a', 'g')), false);
  assert.strictEqual(isCallable(new Date()), false);
  assert.strictEqual(isCallable(42), false);
  assert.strictEqual(isCallable(NaN), false);
  assert.strictEqual(isCallable(Infinity), false);
  assert.strictEqual(isCallable(new Number(42)), false);
  assert.strictEqual(isCallable('foo'), false);
  assert.strictEqual(isCallable(Object('foo')), false);

  // Callable values
  assert.strictEqual(isCallable(function() {}), true); // Regular function
  assert.strictEqual(isCallable(function* () {}), true); // Generator function
  assert.strictEqual(isCallable(x => x * x), true); // Arrow function
  
  console.log('All tests passed!');
} catch (e) {
  console.error('A test failed:', e.message);
}
