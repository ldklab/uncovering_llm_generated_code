markdown
// call-bind/index.js
'use strict';

/**
 * Bind `Function.prototype.call` to a given function `fn`.
 * @param {Function} fn - The function to bind.
 * @returns {Function} - A function with bound `call`.
 */
module.exports = function bindCallToFunction(fn) {
  return function() {
    return Function.prototype.call.apply(fn, arguments);
  };
};

// call-bind/callBound.js
'use strict';

/**
 * Retrieve a method from an object and bind it, ensuring it works
 * even if the original prototype method is modified or deleted.
 * @param {string} methodPath - The path to the method (e.g., 'Array.prototype.slice').
 * @returns {Function} - A bound function.
 */
module.exports = function getBoundMethod(methodPath) {
  const pathSegments = methodPath.split('.');
  let targetObj = globalThis;

  for (let segment of pathSegments) {
    targetObj = targetObj[segment];
  }

  if (typeof targetObj !== 'function') {
    throw new TypeError('path must resolve to a function');
  }

  return Function.prototype.call.bind(targetObj);
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
const bindCallToFunction = require('./index');
const getBoundMethod = require('./callBound');

// Test bindCallToFunction
function testFunction(a, b) {
  assert.strictEqual(this, 1);
  assert.strictEqual(a, 2);
  assert.strictEqual(b, 3);
  assert.strictEqual(arguments.length, 2);
}

const boundFunction = bindCallToFunction(testFunction);
delete Function.prototype.call;
delete Function.prototype.bind;

boundFunction(1, 2, 3);

// Test getBoundMethod
const sliceBound = getBoundMethod('Array.prototype.slice');
assert.deepStrictEqual(sliceBound([1, 2, 3, 4], 1, -1), [2, 3]);

console.log('All tests passed.');
