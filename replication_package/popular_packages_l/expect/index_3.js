// index.js
module.exports = {
  expect,
};

/**
 * Factory function to create a wrapped 'expect' object with matchers
 * @param {*} actual - The actual value to be tested
 * @returns {object} An object with matchers for assertions
 */
function expect(actual) {
  const assert = (condition, errorMessage) => {
    if (!condition) {
      throw new Error(errorMessage);
    }
  };

  const matchers = {
    toBe(expected) {
      assert(actual === expected, `Expected ${actual} to be ${expected}`);
    },
    toEqual(expected) {
      assert(JSON.stringify(actual) === JSON.stringify(expected), `Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
    },
    toBeTruthy() {
      assert(!!actual, `Expected ${actual} to be truthy`);
    },
    toBeFalsy() {
      assert(!actual, `Expected ${actual} to be falsy`);
    },
    toBeNull() {
      assert(actual === null, `Expected ${actual} to be null`);
    },
    toBeDefined() {
      assert(actual !== undefined, `Expected ${actual} to be defined`);
    },
    toBeUndefined() {
      assert(actual === undefined, `Expected ${actual} to be undefined`);
    },
  };

  const negatedMatchers = {
    toBe(expected) {
      assert(actual !== expected, `Expected ${actual} not to be ${expected}`);
    },
    toEqual(expected) {
      assert(JSON.stringify(actual) !== JSON.stringify(expected), `Expected ${JSON.stringify(actual)} not to equal ${JSON.stringify(expected)}`);
    },
    toBeTruthy() {
      assert(!actual, `Expected ${actual} to be falsy`);
    },
    toBeFalsy() {
      assert(!!actual, `Expected ${actual} to be truthy`);
    },
    toBeNull() {
      assert(actual !== null, `Expected ${actual} not to be null`);
    },
    toBeDefined() {
      assert(actual === undefined, `Expected ${actual} to be undefined`);
    },
    toBeUndefined() {
      assert(actual !== undefined, `Expected ${actual} not to be undefined`);
    },
  };

  return {
    ...matchers,
    not: negatedMatchers,
  };
}
