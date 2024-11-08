json
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
  if (value && typeof value === 'object') {
    try {
      return Object.prototype.toString.call(value) === '[object WeakSet]';
    } catch (e) {
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
    assert.isFalse(isWeakSet(function () {}));
    assert.isFalse(isWeakSet(null));
    assert.isFalse(isWeakSet(function* () { yield 42; return Infinity; }));
    assert.isFalse(isWeakSet(Symbol('foo')));
    assert.isFalse(isWeakSet(1n));
    assert.isFalse(isWeakSet(Object(1n)));

    assert.isFalse(isWeakSet(new Set()));
    assert.isFalse(isWeakSet(new WeakMap()));
    assert.isFalse(isWeakSet(new Map()));
  });

  it('should return true for WeakSet instances', function () {
    assert.isTrue(isWeakSet(new WeakSet()));

    class MyWeakSet extends WeakSet {}
    assert.isTrue(isWeakSet(new MyWeakSet()));
  });
});
