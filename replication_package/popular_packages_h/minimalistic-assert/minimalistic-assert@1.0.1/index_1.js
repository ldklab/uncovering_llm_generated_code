module.exports = function assert(value, message) {
  if (!value) {
    throw new Error(message || 'Assertion failed');
  }
};

module.exports.equal = function(left, right, message) {
  if (left != right) {
    throw new Error(message || `Assertion failed: ${left} != ${right}`);
  }
};
