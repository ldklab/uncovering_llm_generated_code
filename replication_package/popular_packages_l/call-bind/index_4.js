// call-bind/index.js
'use strict';

/**
 * Bind `Function.prototype.call` to a given function `fn`.
 * @param {Function} fn - The function to bind.
 * @returns {Function} - A function with bound `call`.
 */
function callBind(fn) {
  return function boundFunction() {
    return Function.prototype.call.apply(fn, arguments);
  };
}

module.exports = callBind;

// call-bind/callBound.js
'use strict';

/**
 * Retrieve a method from an object and bind it, ensuring it works
 * even if the original prototype method is modified or deleted.
 * @param {string} methodPath - The path to the method (e.g., 'Array.prototype.slice').
 * @returns {Function} - A bound function.
 */
function callBound(methodPath) {
  const pathParts = methodPath.split('.');
  let obj = globalThis;

  for (let part of pathParts) {
    obj = obj[part];
  }

  if (typeof obj !== 'function') {
    throw new TypeError('path must resolve to a function');
  }

  return Function.prototype.call.bind(obj);
}

module.exports = callBound;

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
'use strict';
const assert = require('assert');
const callBind = require('./index');
const callBound = require('./callBound');

// Test callBind
function f(a, b) {
  assert.equal(this, 1);
  assert.equal(a, 2);
  assert.equal(b, 3);
  assert.equal(arguments.length, 2);
}

const fBound = callBind(f);
delete Function.prototype.call;
delete Function.prototype.bind;

fBound(1, 2, 3);

// Test callBound
const slice = callBound('Array.prototype.slice');
assert.deepStrictEqual(slice([1, 2, 3, 4], 1, -1), [2, 3]);

console.log('All tests passed.');
