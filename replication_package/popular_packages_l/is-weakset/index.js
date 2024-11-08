markdown
// package.json
{
  "name": "is-weakset",
  "version": "1.0.0",
  "description": "Check if a value is a JS WeakSet, across realms/iframes and ES6 @@toStringTag manipulation.",
  "main": "index.js",
  "scripts": {
    "test": "mocha"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/your-username/is-weakset.git"
  },
  "keywords": ["WeakSet", "typeof", "check", "utility"],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "mocha": "^10.0.0",
    "chai": "^5.0.0"
  }
}

// index.js
function isWeakSet(value) {
  // Checks if the value is an object and not null
  if (value && typeof value === 'object') {
    try {
      // Uses Object.prototype.toString.call to get the default class string of objects
      return Object.prototype.toString.call(value) === '[object WeakSet]';
    } catch (e) {
      // If there's an error (e.g., with inaccessible objects in specific realms), return false
      return false;
    }
  }
  return false;
}

module.exports = isWeakSet;

// test/index.js
const assert = require('chai').assert;
const isWeakSet = require('../index');

describe('isWeakSet', function () {
  it('should return false for non-WeakSet values', function () {
    assert(!isWeakSet(function () {}));
    assert(!isWeakSet(null));
    assert(!isWeakSet(function* () { yield 42; return Infinity; }));
    assert(!isWeakSet(Symbol('foo')));
    assert(!isWeakSet(1n));
    assert(!isWeakSet(Object(1n)));

    assert(!isWeakSet(new Set()));
    assert(!isWeakSet(new WeakMap()));
    assert(!isWeakSet(new Map()));
  });

  it('should return true for WeakSet instances', function () {
    assert(isWeakSet(new WeakSet()));

    class MyWeakSet extends WeakSet {}
    assert(isWeakSet(new MyWeakSet()));
  });
});
