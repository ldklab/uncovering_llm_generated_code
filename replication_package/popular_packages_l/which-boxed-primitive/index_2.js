// index.js
function identifyBoxedPrimitive(value) {
  if (value === null || typeof value !== 'object') {
    return null;
  }
  
  const typeCheck = Object.prototype.toString.call(value);
  
  switch (typeCheck) {
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
      return undefined;
  }
}

module.exports = identifyBoxedPrimitive;

// test.js
const identifyBoxedPrimitive = require('./index');
const assert = require('assert');

assert.strictEqual(identifyBoxedPrimitive(undefined), null);
assert.strictEqual(identifyBoxedPrimitive(null), null);
assert.strictEqual(identifyBoxedPrimitive(false), null);
assert.strictEqual(identifyBoxedPrimitive(true), null);
assert.strictEqual(identifyBoxedPrimitive(new Boolean(false)), 'Boolean');
assert.strictEqual(identifyBoxedPrimitive(new Boolean(true)), 'Boolean');
assert.strictEqual(identifyBoxedPrimitive(42), null);
assert.strictEqual(identifyBoxedPrimitive(NaN), null);
assert.strictEqual(identifyBoxedPrimitive(Infinity), null);
assert.strictEqual(identifyBoxedPrimitive(new Number(42)), 'Number');
assert.strictEqual(identifyBoxedPrimitive(new Number(NaN)), 'Number');
assert.strictEqual(identifyBoxedPrimitive(new Number(Infinity)), 'Number');
assert.strictEqual(identifyBoxedPrimitive(''), null);
assert.strictEqual(identifyBoxedPrimitive('foo'), null);
assert.strictEqual(identifyBoxedPrimitive(new String('')), 'String');
assert.strictEqual(identifyBoxedPrimitive(new String('foo')), 'String');
assert.strictEqual(identifyBoxedPrimitive(Symbol()), null);
assert.strictEqual(identifyBoxedPrimitive(Object(Symbol())), 'Symbol');
assert.strictEqual(identifyBoxedPrimitive(42n), null);
assert.strictEqual(identifyBoxedPrimitive(Object(42n)), 'BigInt');
assert.strictEqual(identifyBoxedPrimitive([]), undefined);
assert.strictEqual(identifyBoxedPrimitive({}), undefined);
assert.strictEqual(identifyBoxedPrimitive(/a/g), undefined);
assert.strictEqual(identifyBoxedPrimitive(new RegExp('a', 'g')), undefined);
assert.strictEqual(identifyBoxedPrimitive(new Date()), undefined);
assert.strictEqual(identifyBoxedPrimitive(() => {}), undefined);
assert.strictEqual(identifyBoxedPrimitive(function* () {}), undefined);
assert.strictEqual(identifyBoxedPrimitive(function () {}), undefined);

// package.json
{
  "name": "identify-boxed-primitive",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "node test.js"
  },
  "devDependencies": {},
  "dependencies": {}
}
