// is-finalizationregistry.js
'use strict';

// Function to check if a given input is an instance of FinalizationRegistry
function isFinalizationRegistry(value) {
  // Ensure value is an object and not null
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  
  // Check if the input is an instance of FinalizationRegistry or a similar construct across different realms
  return typeof value.constructor === 'function' &&
         value.constructor.prototype &&
         value instanceof value.constructor &&
         (Object.prototype.toString.call(value) === '[object FinalizationRegistry]' ||
          (Object.prototype.toString.call(value) === '[object Object]' &&
          value.constructor.name === 'FinalizationRegistry'));
}

module.exports = isFinalizationRegistry;

// test.js
'use strict';

var assert = require('assert');
var isFinalizationRegistry = require('./is-finalizationregistry');

// Various test cases for verifying the functionality of isFinalizationRegistry
assert(!isFinalizationRegistry(function () {}));
assert(!isFinalizationRegistry(null));
assert(!isFinalizationRegistry(function* () { yield 42; return Infinity; }));
assert(!isFinalizationRegistry(Symbol('foo')));
assert(!isFinalizationRegistry(1n));
assert(!isFinalizationRegistry(Object(1n)));

assert(!isFinalizationRegistry(new Set()));
assert(!isFinalizationRegistry(new WeakSet()));
assert(!isFinalizationRegistry(new Map()));
assert(!isFinalizationRegistry(new WeakMap()));
assert(!isFinalizationRegistry(new WeakRef({})));

assert(isFinalizationRegistry(new FinalizationRegistry(function () {})));

class MyFinalizationRegistry extends FinalizationRegistry {}
assert(isFinalizationRegistry(new MyFinalizationRegistry(function () {})));

console.log('All tests passed!');

// package.json
{
  "name": "is-finalizationregistry",
  "version": "1.0.0",
  "description": "Check if a value is a JS FinalizationRegistry",
  "main": "is-finalizationregistry.js",
  "scripts": {
    "test": "node test.js"
  },
  "keywords": [
    "FinalizationRegistry",
    "type-checking",
    "javascript"
  ],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "assert": "^2.0.0"
  }
}
