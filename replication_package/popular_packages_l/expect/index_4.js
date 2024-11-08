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
  return {
    toBe(expected) {
      assert(actual === expected, `Expected ${actual} to be ${expected}`);
    },
    toEqual(expected) {
      assert(
        JSON.stringify(actual) === JSON.stringify(expected),
        `Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`
      );
    },
    toBeTruthy() {
      assert(actual, `Expected ${actual} to be truthy`);
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
    not: {
      toBe(expected) {
        assert(actual !== expected, `Expected ${actual} not to be ${expected}`);
      },
      toEqual(expected) {
        assert(
          JSON.stringify(actual) !== JSON.stringify(expected),
          `Expected ${JSON.stringify(actual)} not to equal ${JSON.stringify(expected)}`
        );
      },
      toBeTruthy() {
        assert(!actual, `Expected ${actual} to be falsy`);
      },
      toBeFalsy() {
        assert(actual, `Expected ${actual} to be truthy`);
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
    },
  };
}

/**
 * Wrapper function for assertion to simplify error throwing in matchers
 * @param {boolean} condition - The condition to assert
 * @param {string} message - The error message if the assertion fails
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
