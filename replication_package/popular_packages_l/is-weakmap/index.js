// is-weakmap implementation
function isWeakMap(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }
  try {
    WeakMap.prototype.has.call(value);
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = isWeakMap;

// Tests for is-weakmap
const assert = require('assert');

(function runTests() {
  assert(!isWeakMap(function () {}), 'Function should not be a WeakMap');
  assert(!isWeakMap(null), 'null should not be a WeakMap');
  assert(!isWeakMap(function* () { yield 42; return Infinity; }), 'Generator function should not be a WeakMap');
  assert(!isWeakMap(Symbol('foo')), 'Symbol should not be a WeakMap');
  assert(!isWeakMap(1n), 'BigInt should not be a WeakMap');
  assert(!isWeakMap(Object(1n)), 'Object BigInt should not be a WeakMap');

  assert(!isWeakMap(new Set()), 'Set should not be a WeakMap');
  assert(!isWeakMap(new WeakSet()), 'WeakSet should not be a WeakMap');
  assert(!isWeakMap(new Map()), 'Map should not be a WeakMap');

  assert(isWeakMap(new WeakMap()), 'WeakMap should be a WeakMap');

  class MyWeakMap extends WeakMap {}
  assert(isWeakMap(new MyWeakMap()), 'Instance of WeakMap subclass should be a WeakMap');

  console.log("All tests passed!");
})();
