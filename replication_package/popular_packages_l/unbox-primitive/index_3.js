const unboxPrimitive = require('unbox-primitive');
const assert = require('assert');

// Unbox a Boolean object to its primitive value
assert.strictEqual(unboxPrimitive(new Boolean(false)), false);

// Unbox a String object to its primitive value
assert.strictEqual(unboxPrimitive(new String('f')), 'f');

// Unbox a Number object to its primitive value
assert.strictEqual(unboxPrimitive(new Number(42)), 42);

// Unbox a Symbol object to its primitive value
const symbol = Symbol();
assert.strictEqual(unboxPrimitive(Object(symbol)), symbol);

// Unbox a BigInt object to its primitive value
assert.strictEqual(unboxPrimitive(Object(42n)), 42n);
