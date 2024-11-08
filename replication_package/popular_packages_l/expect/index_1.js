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
      if (actual !== expected) {
        throw new Error(`Expected ${actual} to be ${expected}`);
      }
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected ${actual} to be truthy`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected ${actual} to be falsy`);
      }
    },
    toBeNull() {
      if (actual !== null) {
        throw new Error(`Expected ${actual} to be null`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error(`Expected ${actual} to be defined`);
      }
    },
    toBeUndefined() {
      if (actual !== undefined) {
        throw new Error(`Expected ${actual} to be undefined`);
      }
    },
    not: {
      toBe(expected) {
        if (actual === expected) {
          throw new Error(`Expected ${actual} not to be ${expected}`);
        }
      },
      toEqual(expected) {
        if (JSON.stringify(actual) === JSON.stringify(expected)) {
          throw new Error(`Expected ${JSON.stringify(actual)} not to equal ${JSON.stringify(expected)}`);
        }
      },
      toBeTruthy() {
        if (!!actual) {
          throw new Error(`Expected ${actual} to be falsy`);
        }
      },
      toBeFalsy() {
        if (!actual) {
          throw new Error(`Expected ${actual} to be truthy`);
        }
      },
      toBeNull() {
        if (actual === null) {
          throw new Error(`Expected ${actual} not to be null`);
        }
      },
      toBeDefined() {
        if (actual !== undefined) {
          throw new Error(`Expected ${actual} to be undefined`);
        }
      },
      toBeUndefined() {
        if (actual === undefined) {
          throw new Error(`Expected ${actual} not to be undefined`);
        }
      },
    },
  };
}
