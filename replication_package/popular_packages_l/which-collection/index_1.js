// index.js
function whichCollection(value) {
  if (value instanceof Map) return 'Map';
  if (value instanceof Set) return 'Set';
  if (value instanceof WeakMap) return 'WeakMap';
  if (value instanceof WeakSet) return 'WeakSet';
  return false;
}

module.exports = whichCollection;

// test.js
const whichCollection = require('./index');
const assert = require('assert');

assert.equal(false, whichCollection(undefined));
assert.equal(false, whichCollection(null));
assert.equal(false, whichCollection(false));
assert.equal(false, whichCollection(true));
assert.equal(false, whichCollection([]));
assert.equal(false, whichCollection({}));
assert.equal(false, whichCollection(/a/g));
assert.equal(false, whichCollection(new RegExp('a', 'g')));
assert.equal(false, whichCollection(new Date()));
assert.equal(false, whichCollection(42));
assert.equal(false, whichCollection(NaN));
assert.equal(false, whichCollection(Infinity));
assert.equal(false, whichCollection(new Number(42)));
assert.equal(false, whichCollection(42n));
assert.equal(false, whichCollection(Object(42n)));
assert.equal(false, whichCollection('foo'));
assert.equal(false, whichCollection(Object('foo')));
assert.equal(false, whichCollection(function () {}));
assert.equal(false, whichCollection(function* () {}));
assert.equal(false, whichCollection(x => x * x));
assert.equal(false, whichCollection([]));

assert.equal('Map', whichCollection(new Map()));
assert.equal('Set', whichCollection(new Set()));
assert.equal('WeakMap', whichCollection(new WeakMap()));
assert.equal('WeakSet', whichCollection(new WeakSet()));

// package.json
{
  "name": "which-collection",
  "version": "1.0.0",
  "description": "Identify whether a value is one of the JavaScript collection types: Map, Set, WeakMap, or WeakSet.",
  "main": "index.js",
  "scripts": {
    "test": "node test.js"
  },
  "author": "Your Name",
  "license": "MIT"
}
