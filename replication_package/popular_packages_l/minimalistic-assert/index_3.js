// minimalistic-assert.js

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
};

module.exports = assert;
