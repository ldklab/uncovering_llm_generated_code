// is-boolean-object.js
'use strict';

/**
 * Checks if the given value is a boolean primitive or a boolean object.
 *
 * @param {*} value - The value to check
 * @returns {boolean} - True if the value is a boolean or boolean object, otherwise false
 */
module.exports = function isBoolean(value) {
    return typeof value === 'boolean' || 
           (typeof value === 'object' && 
            value !== null && 
            Object.prototype.toString.call(value) === '[object Boolean]');
};

// test.js
'use strict';

var assert = require('assert');
var isBoolean = require('./is-boolean-object');

/**
 * Test cases to validate the functionality of isBoolean function.
 */

// Assert that undefined is not identified as a boolean
assert.notOk(isBoolean(undefined), 'undefined is not a boolean');

// Assert that null is not identified as a boolean
assert.notOk(isBoolean(null), 'null is not a boolean');

// Assert that a string is not identified as a boolean
assert.notOk(isBoolean('foo'), 'string is not a boolean');

// Assert that a function is not identified as a boolean
assert.notOk(isBoolean(function () {}), 'function is not a boolean');

// Assert that an array is not identified as a boolean
assert.notOk(isBoolean([]), 'array is not a boolean');

// Assert that an object is not identified as a boolean
assert.notOk(isBoolean({}), 'object is not a boolean');

// Assert that a RegExp is not identified as a boolean
assert.notOk(isBoolean(/a/g), 'regexp literal is not a boolean');
assert.notOk(isBoolean(new RegExp('a', 'g')), 'regexp object is not a boolean');

// Assert that a Date is not identified as a boolean
assert.notOk(isBoolean(new Date()), 'date is not a boolean');

// Assert that a number is not identified as a boolean
assert.notOk(isBoolean(42), 'number is not a boolean');

// Assert that NaN is not identified as a boolean
assert.notOk(isBoolean(NaN), 'NaN is not a boolean');

// Assert that Infinity is not identified as a boolean
assert.notOk(isBoolean(Infinity), 'Infinity is not a boolean');

// Assert that a Boolean object is identified as a boolean
assert.ok(isBoolean(new Boolean(42)), 'new Boolean(42) is a boolean');

// Assert that the primitive value false is identified as a boolean
assert.ok(isBoolean(false), 'false is a boolean');

// Assert that an Object wrapper of false is identified as a boolean
assert.ok(isBoolean(Object(false)), 'Object(false) is a boolean');

// Assert that the primitive value true is identified as a boolean
assert.ok(isBoolean(true), 'true is a boolean');

// Assert that an Object wrapper of true is identified as a boolean
assert.ok(isBoolean(Object(true)), 'Object(true) is a boolean');

// package.json
{
  "name": "is-boolean-object",
  "version": "1.0.0",
  "description": "Is this value a JS Boolean? Module works cross-realm/iframe, and despite ES6 @@toStringTag.",
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
