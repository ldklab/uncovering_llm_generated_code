// is-boolean-object.js
'use strict';

/**
 * Check if a value is a boolean primitive or a boolean object.
 * A boolean primitive is simply the `true` or `false` values.
 * A boolean object is an instance created by the `Boolean` constructor.
 * 
 * @param {*} value - The value to check.
 * @returns {boolean} - Returns `true` if the value is a boolean primitive or boolean object, otherwise `false`.
 */
function isBoolean(value) {
    return (
        typeof value === 'boolean' ||
        (typeof value === 'object' &&
        value !== null &&
        Object.prototype.toString.call(value) === '[object Boolean]')
    );
}

module.exports = isBoolean;

// test.js
'use strict';

const assert = require('assert');
const isBoolean = require('./is-boolean-object');

// Test cases verifying various values and their boolean nature.
assert.strictEqual(isBoolean(undefined), false, 'undefined is not a boolean primitive or object');
assert.strictEqual(isBoolean(null), false, 'null is not a boolean primitive or object');
assert.strictEqual(isBoolean('foo'), false, 'string is not a boolean primitive or object');
assert.strictEqual(isBoolean(() => {}), false, 'function is not a boolean primitive or object');
assert.strictEqual(isBoolean([]), false, 'array is not a boolean primitive or object');
assert.strictEqual(isBoolean({}), false, 'object is not a boolean primitive or object');
assert.strictEqual(isBoolean(/a/g), false, 'regexp literal is not a boolean primitive or object');
assert.strictEqual(isBoolean(new RegExp('a', 'g')), false, 'regexp object is not a boolean primitive or object');
assert.strictEqual(isBoolean(new Date()), false, 'date is not a boolean primitive or object');
assert.strictEqual(isBoolean(42), false, 'number is not a boolean primitive or object');
assert.strictEqual(isBoolean(NaN), false, 'NaN is not a boolean primitive or object');
assert.strictEqual(isBoolean(Infinity), false, 'Infinity is not a boolean primitive or object');

assert.strictEqual(isBoolean(new Boolean(42)), true, 'new Boolean(42) is a boolean object');
assert.strictEqual(isBoolean(false), true, 'false is a boolean primitive');
assert.strictEqual(isBoolean(Object(false)), true, 'Object(false) is a boolean object');
assert.strictEqual(isBoolean(true), true, 'true is a boolean primitive');
assert.strictEqual(isBoolean(Object(true)), true, 'Object(true) is a boolean object');

// package.json
{
  "name": "is-boolean-object",
  "version": "1.0.0",
  "description": "Utility to determine if a value is a JavaScript Boolean, supporting cross-realm/iframe, and compatible with ES6 @@toStringTag.",
  "main": "is-boolean-object.js",
  "scripts": {
    "test": "node test.js"
  },
  "keywords": [
    "boolean",
    "utility",
    "type-check"
  ],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "assert": "^2.0.0"
  }
}
