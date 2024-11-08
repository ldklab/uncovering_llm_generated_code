module.exports = assert;

function assert(value, message) {
  if (!value) {
    throw new Error(message || 'Assertion failed');
  }
}

assert.equal = function(left, right, message) {
  if (left != right) {
    throw new Error(message || `Assertion failed: ${left} != ${right}`);
  }
};
