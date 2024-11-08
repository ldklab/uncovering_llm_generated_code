// is-boolean-object.js
'use strict';

module.exports = function isBoolean(value) {
    return typeof value === 'boolean' || 
           (typeof value === 'object' && 
            value !== null && 
            Object.prototype.toString.call(value) === '[object Boolean]');
};

// test.js
'use strict';

const assert = require('assert');
const isBoolean = require('./is-boolean-object');

// Test cases for non-booleans
assert.strictEqual(isBoolean(undefined), false, 'undefined is not a boolean');
assert.strictEqual(isBoolean(null), false, 'null is not a boolean');
assert.strictEqual(isBoolean('foo'), false, 'string is not a boolean');
assert.strictEqual(isBoolean(function () {}), false, 'function is not a boolean');
assert.strictEqual(isBoolean([]), false, 'array is not a boolean');
assert.strictEqual(isBoolean({}), false, 'object is not a boolean');
assert.strictEqual(isBoolean(/a/g), false, 'regexp literal is not a boolean');
assert.strictEqual(isBoolean(new RegExp('a', 'g')), false, 'regexp object is not a boolean');
assert.strictEqual(isBoolean(new Date()), false, 'date is not a boolean');
assert.strictEqual(isBoolean(42), false, 'number is not a boolean');
assert.strictEqual(isBoolean(NaN), false, 'NaN is not a boolean');
assert.strictEqual(isBoolean(Infinity), false, 'Infinity is not a boolean');

// Test cases for booleans
assert.strictEqual(isBoolean(new Boolean(42)), true, 'new Boolean(42) is a boolean');
assert.strictEqual(isBoolean(false), true, 'false is a boolean');
assert.strictEqual(isBoolean(Object(false)), true, 'Object(false) is a boolean');
assert.strictEqual(isBoolean(true), true, 'true is a boolean');
assert.strictEqual(isBoolean(Object(true)), true, 'Object(true) is a boolean');

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
