// index.js
function determineBoxedPrimitive(value) {
  if (value === null || typeof value !== 'object') {
    return null; // Return null for unboxed primitives and null
  }
  
  // Get the internal [[Class]] of the object using toString
  const toStringTag = Object.prototype.toString.call(value);
  
  // Compare the toStringTag to determine the type of boxed primitive
  switch (toStringTag) {
    case '[object Boolean]':
      return 'Boolean';
    case '[object Number]':
      return 'Number';
    case '[object String]':
      return 'String';
    case '[object Symbol]':
      return 'Symbol';
    case '[object BigInt]':
      return 'BigInt';
    default:
      return undefined; // Return undefined if not a boxed primitive
  }
}

module.exports = determineBoxedPrimitive;

// test.js
const determineBoxedPrimitive = require('./index');
const assert = require('assert');

assert.strictEqual(determineBoxedPrimitive(undefined), null);
assert.strictEqual(determineBoxedPrimitive(null), null);
assert.strictEqual(determineBoxedPrimitive(false), null);
assert.strictEqual(determineBoxedPrimitive(true), null);
assert.strictEqual(determineBoxedPrimitive(new Boolean(false)), 'Boolean');
assert.strictEqual(determineBoxedPrimitive(new Boolean(true)), 'Boolean');

assert.strictEqual(determineBoxedPrimitive(42), null);
assert.strictEqual(determineBoxedPrimitive(NaN), null);
assert.strictEqual(determineBoxedPrimitive(Infinity), null);
assert.strictEqual(determineBoxedPrimitive(new Number(42)), 'Number');
assert.strictEqual(determineBoxedPrimitive(new Number(NaN)), 'Number');
assert.strictEqual(determineBoxedPrimitive(new Number(Infinity)), 'Number');

assert.strictEqual(determineBoxedPrimitive(''), null);
assert.strictEqual(determineBoxedPrimitive('foo'), null);
assert.strictEqual(determineBoxedPrimitive(new String('')), 'String');
assert.strictEqual(determineBoxedPrimitive(new String('foo')), 'String');

assert.strictEqual(determineBoxedPrimitive(Symbol()), null);
assert.strictEqual(determineBoxedPrimitive(Object(Symbol())), 'Symbol');

assert.strictEqual(determineBoxedPrimitive(42n), null);
assert.strictEqual(determineBoxedPrimitive(Object(42n)), 'BigInt');

assert.strictEqual(determineBoxedPrimitive([]), undefined);
assert.strictEqual(determineBoxedPrimitive({}), undefined);
assert.strictEqual(determineBoxedPrimitive(/a/g), undefined);
assert.strictEqual(determineBoxedPrimitive(new RegExp('a', 'g')), undefined);
assert.strictEqual(determineBoxedPrimitive(new Date()), undefined);
assert.strictEqual(determineBoxedPrimitive(function () {}), undefined);
assert.strictEqual(determineBoxedPrimitive(function* () {}), undefined);
assert.strictEqual(determineBoxedPrimitive(x => x * x), undefined);
assert.strictEqual(determineBoxedPrimitive([]), undefined);

// package.json
{
  "name": "determine-boxed-primitive",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "node test.js"
  },
  "devDependencies": {},
  "dependencies": {}
}
