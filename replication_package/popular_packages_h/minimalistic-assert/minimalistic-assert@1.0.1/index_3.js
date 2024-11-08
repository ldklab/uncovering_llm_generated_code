function assert(value, message) {
  if (!value) {
    throw new Error(message || 'Assertion failed');
  }
}

assert.equal = function(value1, value2, message) {
  if (value1 != value2) {
    throw new Error(message || `Assertion failed: ${value1} != ${value2}`);
  }
};

module.exports = assert;
