// is-callable/index.js

'use strict';

module.exports = function isCallable(value) {
  // Return false if the value is null or undefined
  if (value == null) {
    return false;
  }
  
  // Return true if the value is a function type
  if (typeof value === 'function') {
    return true;
  }

  // For object types, further checks are needed for ES6+ features
  if (typeof value === 'object') {
    // Check if the environment supports Symbol and toStringTag
    if (typeof Symbol !== 'undefined' && typeof Symbol.toStringTag === 'symbol') {
      try {
        // Convert the value to its string representation using Function.prototype.toString
        var fnToString = Function.prototype.toString;
        var valueString = fnToString.call(value);
        
        // If the string starts with function* or class, it's a generator or class, not a regular callable
        if (/^\s*function\s*\*/.test(valueString) || /^\s*class\b/.test(valueString)) {
          return false;
        }

        // Check if it starts with function or class, indicating it's callable
        return /^\s*(function|class)\s*/.test(valueString);
      } catch (e) {
        // If toString throws, consider it non-callable
        return false;
      }
    }
  }
  // Default return false if none of the above conditions are met
  return false;
};

// is-callable/test/test.js

'use strict';

var assert = require('assert');
var isCallable = require('../index');

// Tests to verify the isCallable function
try {
  // Test cases where the value is not callable
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

  // Test cases where the value is callable
  assert.strictEqual(isCallable(function() {}), true);
  assert.strictEqual(isCallable(function* () {}), true);
  assert.strictEqual(isCallable(x => x * x), true);
  
  console.log('All tests passed!');
} catch (e) {
  console.error('A test failed:', e.message);
}
