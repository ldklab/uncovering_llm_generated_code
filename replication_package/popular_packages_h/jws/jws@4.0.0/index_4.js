/*global exports*/
const SignStream = require('./lib/sign-stream');
const VerifyStream = require('./lib/verify-stream');

// Supported cryptographic algorithms
const ALGORITHMS = [
  'HS256', 'HS384', 'HS512',
  'RS256', 'RS384', 'RS512',
  'PS256', 'PS384', 'PS512',
  'ES256', 'ES384', 'ES512'
];

// Export ALGORITHMS and the cryptographic functions
exports.ALGORITHMS = ALGORITHMS;
exports.sign = SignStream.sign;
exports.verify = VerifyStream.verify;
exports.decode = VerifyStream.decode;
exports.isValid = VerifyStream.isValid;

// Factory function to create a SignStream instance
exports.createSign = function(opts) {
  return new SignStream(opts);
};

// Factory function to create a VerifyStream instance
exports.createVerify = function(opts) {
  return new VerifyStream(opts);
};
