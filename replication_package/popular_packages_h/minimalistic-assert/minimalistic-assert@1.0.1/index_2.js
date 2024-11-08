class AssertError extends Error {
  constructor(message) {
    super(message);
    this.name = "AssertError";
  }
}

const assert = (val, msg) => {
  if (!val) {
    throw new AssertError(msg || 'Assertion failed');
  }
};

assert.equal = (l, r, msg) => {
  if (l != r) {
    throw new AssertError(msg || `Assertion failed: ${l} != ${r}`);
  }
};

module.exports = assert;
