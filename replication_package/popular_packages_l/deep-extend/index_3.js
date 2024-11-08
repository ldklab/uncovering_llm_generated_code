// deep-merge.js

function isPlainObject(item) {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
}

function deepMerge(target, ...sources) {
  if (!sources.length) return target;

  const source = sources.shift();

  if (isPlainObject(target) && isPlainObject(source)) {
    Object.keys(source).forEach(key => {
      if (isPlainObject(source[key])) {
        if (!target.hasOwnProperty(key)) {
          target[key] = {};
        }
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    });
  }
  
  return deepMerge(target, ...sources);
}

module.exports = deepMerge;

// Usage example as described in the README

const object1 = {
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

const object2 = {
  b: 3,
  c: 5,
  d: {
    b: { first: 'one', second: 'two' },
    c: { test2: 222 }
  },
  e: { one: 1, two: 2 },
  f: [],
  g: undefined,
  h: /abc/g,
  i: null,
  j: [3, 4]
};

deepMerge(object1, object2);

console.log(object1);

// To run tests (assuming you're using Mocha)

const assert = require('assert');

describe('deepMerge', function() {
  it('should recursively merge properties of objects', function() {
    const objA = { a: 1, b: { c: [1, 2], d: 'str' } };
    const objB = { b: { c: [3], e: 'new' }, f: 5 };
    const expected = { a: 1, b: { c: [3], d: 'str', e: 'new' }, f: 5 };

    assert.deepStrictEqual(deepMerge({}, objA, objB), expected);
  });

  it('should overwrite simple values with the rightmost ones', function() {
    const objA = { a: 1 };
    const objB = { a: 2 };

    assert.deepStrictEqual(deepMerge({}, objA, objB), { a: 2 });
  });
});
