// isTypedArray.js

function isTypedArray(value) {
  return ArrayBuffer.isView(value) && !(value instanceof DataView);
}

module.exports = isTypedArray;

// test.js

const assert = require('assert');
const isTypedArray = require('./isTypedArray');

// Tests for non-typed-array values
assert.strictEqual(isTypedArray(undefined), false);
assert.strictEqual(isTypedArray(null), false);
assert.strictEqual(isTypedArray(false), false);
assert.strictEqual(isTypedArray(true), false);
assert.strictEqual(isTypedArray([]), false);
assert.strictEqual(isTypedArray({}), false);
assert.strictEqual(isTypedArray(/a/g), false);
assert.strictEqual(isTypedArray(new RegExp('a', 'g')), false);
assert.strictEqual(isTypedArray(new Date()), false);
assert.strictEqual(isTypedArray(42), false);
assert.strictEqual(isTypedArray(NaN), false);
assert.strictEqual(isTypedArray(Infinity), false);
assert.strictEqual(isTypedArray(new Number(42)), false);
assert.strictEqual(isTypedArray('foo'), false);
assert.strictEqual(isTypedArray(Object('foo')), false);
assert.strictEqual(isTypedArray(function () {}), false);
assert.strictEqual(isTypedArray(function* () {}), false);
assert.strictEqual(isTypedArray(x => x * x), false);
assert.strictEqual(isTypedArray([]), false);

// Tests for typed-array instances
assert.ok(isTypedArray(new Int8Array()));
assert.ok(isTypedArray(new Uint8Array()));
assert.ok(isTypedArray(new Uint8ClampedArray()));
assert.ok(isTypedArray(new Int16Array()));
assert.ok(isTypedArray(new Uint16Array()));
assert.ok(isTypedArray(new Int32Array()));
assert.ok(isTypedArray(new Uint32Array()));
assert.ok(isTypedArray(new Float32Array()));
assert.ok(isTypedArray(new Float64Array()));
assert.ok(isTypedArray(new BigInt64Array()));
assert.ok(isTypedArray(new BigUint64Array()));

console.log("All tests passed!");
