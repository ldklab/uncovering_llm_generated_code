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

assert.strictEqual(whichCollection(undefined), false);
assert.strictEqual(whichCollection(null), false);
assert.strictEqual(whichCollection(false), false);
assert.strictEqual(whichCollection(true), false);
assert.strictEqual(whichCollection([]), false);
assert.strictEqual(whichCollection({}), false);
assert.strictEqual(whichCollection(/a/g), false);
assert.strictEqual(whichCollection(new RegExp('a', 'g')), false);
assert.strictEqual(whichCollection(new Date()), false);
assert.strictEqual(whichCollection(42), false);
assert.strictEqual(whichCollection(NaN), false);
assert.strictEqual(whichCollection(Infinity), false);
assert.strictEqual(whichCollection(new Number(42)), false);
assert.strictEqual(whichCollection(42n), false);
assert.strictEqual(whichCollection(Object(42n)), false);
assert.strictEqual(whichCollection('foo'), false);
assert.strictEqual(whichCollection(Object('foo')), false);
assert.strictEqual(whichCollection(function () {}), false);
assert.strictEqual(whichCollection(function* () {}), false);
assert.strictEqual(whichCollection(x => x * x), false);
assert.strictEqual(whichCollection([]), false);

assert.strictEqual(whichCollection(new Map()), 'Map');
assert.strictEqual(whichCollection(new Set()), 'Set');
assert.strictEqual(whichCollection(new WeakMap()), 'WeakMap');
assert.strictEqual(whichCollection(new WeakSet()), 'WeakSet');

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
