// deep-extend.js

function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

function deepExtend(target, ...sources) {
  if (sources.length < 1) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) target[key] = {};
        deepExtend(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }

  return deepExtend(target, ...sources);
}

module.exports = deepExtend;

// Usage example as described in the README

var obj1 = {
  a: 1,
  b: 2,
  d: {
    a: 1,
    b: [],
    c: { test1: 123, test2: 321 }
  },
  f: 5,
  g: 123,
  i: 321,
  j: [1, 2]
};

var obj2 = {
  b: 3,
  c: 5,
  d: {
    b: { first: 'one', second: 'two' },
    c: { test2: 222 }
  },
  e: { one: 1, two: 2 },
  f: [],
  g: void 0,
  h: /abc/g,
  i: null,
  j: [3, 4]
};

deepExtend(obj1, obj2);

console.log(obj1);

// To run tests (assuming you're using Mocha)

const assert = require('assert');

describe('deepExtend', function() {
  it('should recursively merge properties of objects', function() {
    const objA = { a: 1, b: { c: [1, 2], d: 'str' } };
    const objB = { b: { c: [3], e: 'new' }, f: 5 };
    const expected = { a: 1, b: { c: [3], d: 'str', e: 'new' }, f: 5 };

    assert.deepStrictEqual(deepExtend({}, objA, objB), expected);
  });

  it('should overwrite simple values with the rightmost ones', function() {
    const objA = { a: 1 };
    const objB = { a: 2 };

    assert.deepStrictEqual(deepExtend({}, objA, objB), { a: 2 });
  });
});
