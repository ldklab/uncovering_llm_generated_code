// deep-extend.js

/**
 * This function checks if a given item is an object.
 * @param {*} item - The item to check.
 * @returns {boolean} - Returns true if the item is a non-array object, otherwise false.
 */
function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * This function deeply merges the properties of source objects into a target object.
 * @param {Object} target - The target object that will receive properties from source objects.
 * @param {...Object} sources - One or more source objects whose properties will be copied to the target object.
 * @returns {Object} - Returns the modified target object.
 */
function deepExtend(target, ...sources) {
  // Exit if there are no sources to merge from
  if (!sources.length) return target;
  
  // Take the first source object from the sources list
  const source = sources.shift();

  // Merge source into target if both are objects
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        // If the target doesn't have a nested object, create an empty object
        if (!target[key]) Object.assign(target, { [key]: {} });
        // Recursively merge the nested objects
        deepExtend(target[key], source[key]);
      } else {
        // Directly assign the value if it's not an object
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  // Continue with the remaining source objects
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
  g: undefined,
  h: /abc/g,
  i: null,
  j: [3, 4]
};

// Merge obj2 into obj1
deepExtend(obj1, obj2);

console.log(obj1);

// Test suite for deepExtend function using Mocha

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
