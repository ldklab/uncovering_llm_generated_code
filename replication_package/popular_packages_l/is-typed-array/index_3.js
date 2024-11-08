// isTypedArray.js

/**
 * Checks if the given value is a typed array, excluding the DataView.
 * A value is considered a typed array if it is viewed as an ArrayBuffer, 
 * but it should not be an instance of DataView.
 * 
 * @param {any} value - The value to check.
 * @returns {boolean} - Returns true if the value is a typed array, false otherwise.
 */
function isTypedArray(value) {
  return ArrayBuffer.isView(value) && !(value instanceof DataView);
}

module.exports = isTypedArray;

// test.js

const assert = require('assert');
const isTypedArray = require('./isTypedArray');

/**
 * Test suite for the isTypedArray function.
 */

// Tests for non-typed-array values
assert.strictEqual(isTypedArray(undefined), false, 'undefined should not be a typed array');
assert.strictEqual(isTypedArray(null), false, 'null should not be a typed array');
assert.strictEqual(isTypedArray(false), false, 'false should not be a typed array');
assert.strictEqual(isTypedArray(true), false, 'true should not be a typed array');
assert.strictEqual(isTypedArray([]), false, 'Array should not be a typed array');
assert.strictEqual(isTypedArray({}), false, 'Object should not be a typed array');
assert.strictEqual(isTypedArray(/a/g), false, 'Regex should not be a typed array');
assert.strictEqual(isTypedArray(new RegExp('a', 'g')), false, 'RegExp object should not be a typed array');
assert.strictEqual(isTypedArray(new Date()), false, 'Date should not be a typed array');
assert.strictEqual(isTypedArray(42), false, 'Number should not be a typed array');
assert.strictEqual(isTypedArray(NaN), false, 'NaN should not be a typed array');
assert.strictEqual(isTypedArray(Infinity), false, 'Infinity should not be a typed array');
assert.strictEqual(isTypedArray(new Number(42)), false, 'Number object should not be a typed array');
assert.strictEqual(isTypedArray('foo'), false, 'String should not be a typed array');
assert.strictEqual(isTypedArray(Object('foo')), false, 'String object should not be a typed array');
assert.strictEqual(isTypedArray(function () {}), false, 'Function should not be a typed array');
assert.strictEqual(isTypedArray(function* () {}), false, 'Generator function should not be a typed array');
assert.strictEqual(isTypedArray(x => x * x), false, 'Arrow function should not be a typed array');
assert.strictEqual(isTypedArray([]), false, 'Array should not be a typed array');

// Tests for typed-array instances
assert.ok(isTypedArray(new Int8Array()), 'Int8Array should be a typed array');
assert.ok(isTypedArray(new Uint8Array()), 'Uint8Array should be a typed array');
assert.ok(isTypedArray(new Uint8ClampedArray()), 'Uint8ClampedArray should be a typed array');
assert.ok(isTypedArray(new Int16Array()), 'Int16Array should be a typed array');
assert.ok(isTypedArray(new Uint16Array()), 'Uint16Array should be a typed array');
assert.ok(isTypedArray(new Int32Array()), 'Int32Array should be a typed array');
assert.ok(isTypedArray(new Uint32Array()), 'Uint32Array should be a typed array');
assert.ok(isTypedArray(new Float32Array()), 'Float32Array should be a typed array');
assert.ok(isTypedArray(new Float64Array()), 'Float64Array should be a typed array');
assert.ok(isTypedArray(new BigInt64Array()), 'BigInt64Array should be a typed array');
assert.ok(isTypedArray(new BigUint64Array()), 'BigUint64Array should be a typed array');

console.log("All tests passed! Congratulations!");
