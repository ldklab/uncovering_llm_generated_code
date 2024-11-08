markdown
// call-bind/index.js
'use strict';

/**
 * Binds `Function.prototype.call` to the provided function `fn`.
 * @param {Function} fn - Target function to bind.
 * @returns {Function} - A new function with `call` bound.
 */
module.exports = function callBind(fn) {
  return function boundFunction() {
    return Function.prototype.call.apply(fn, arguments);
  };
};

// call-bind/callBound.js
'use strict';

/**
 * Binds a specified method from an object path to ensure reliability
 * despite prototype modifications.
 * @param {string} methodPath - Dot-separated path to the method, e.g., 'Array.prototype.slice'.
 * @returns {Function} - The function bound with `call`.
 */
module.exports = function callBound(methodPath) {
  const pathParts = methodPath.split('.');
  let obj = globalThis;

  for (const part of pathParts) {
    obj = obj[part];
  }

  if (typeof obj !== 'function') {
    throw new TypeError('The path must resolve to a valid function');
  }

  return Function.prototype.call.bind(obj);
};

// package.json
{
  "name": "call-bind",
  "version": "1.0.0",
  "main": "index.js",
  "devDependencies": {
    "assert": "^1.5.0"
  },
  "scripts": {
    "test": "node test.js"
  }
}

// test.js
const assert = require('assert');
const callBind = require('./index');
const callBound = require('./callBound');

// Test callBind functionality
function f(a, b) {
  assert.strictEqual(this, 1);
  assert.strictEqual(a, 2);
  assert.strictEqual(b, 3);
  assert.strictEqual(arguments.length, 2);
}

const fBound = callBind(f);
delete Function.prototype.call;
delete Function.prototype.bind;

fBound(1, 2, 3);

// Test callBound functionality
const slice = callBound('Array.prototype.slice');
assert.deepStrictEqual(slice([1, 2, 3, 4], 1, -1), [2, 3]);

console.log('All tests passed.');
