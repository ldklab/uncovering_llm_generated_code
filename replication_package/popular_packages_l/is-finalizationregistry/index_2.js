markdown
// is-finalizationregistry.js
'use strict';

// Function to check if a value is an instance of FinalizationRegistry.
function isFinalizationRegistry(value) {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  // Verify the value's constructor and prototype for FinalizationRegistry properties.
  const isConstructorFunction = typeof value.constructor === 'function';
  const hasPrototypeForChecking = value.constructor.prototype;
  const isInstanceOfConstructor = value instanceof value.constructor;

  // Determine if the value's stringified type suggests it's a FinalizationRegistry.
  const isCorrectPrototypeString =
    Object.prototype.toString.call(value) === '[object FinalizationRegistry]' ||
    (Object.prototype.toString.call(value) === '[object Object]' &&
     value.constructor.name === 'FinalizationRegistry');

  // Return true only if all checks confirm that the value is a FinalizationRegistry instance.
  return isConstructorFunction && hasPrototypeForChecking && isInstanceOfConstructor && isCorrectPrototypeString;
}

module.exports = isFinalizationRegistry;

// test.js
'use strict';

const assert = require('assert');
const isFinalizationRegistry = require('./is-finalizationregistry');

// Testing different inputs to validate the isFinalizationRegistry function.
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
