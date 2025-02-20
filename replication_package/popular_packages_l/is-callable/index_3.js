// is-callable/index.js

'use strict';

module.exports = function isCallable(value) {
  if (typeof value === 'function') {
    return true;
  }
  
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'object' && typeof Symbol.toStringTag === 'symbol') {
    try {
      const fnToString = Function.prototype.toString;
      const valueString = fnToString.call(value);

      if (/^\s*function\s*\*/.test(valueString) || /^\s*class\b/.test(valueString)) {
        return false;
      }

      return /^\s*(function|class)\s*/.test(valueString);
    } catch (e) {
      return false;
    }
  }
  
  return false;
};

// is-callable/test/test.js

'use strict';

const assert = require('assert');
const isCallable = require('../index');

try {
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

  assert.strictEqual(isCallable(function() {}), true);
  assert.strictEqual(isCallable(function* () {}), true);
  assert.strictEqual(isCallable(x => x * x), true);
  
  console.log('All tests passed!');
} catch (e) {
  console.error('A test failed:', e.message);
}
