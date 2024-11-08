// Import the SignStream and VerifyStream modules
var SignStream = require('./lib/sign-stream');
var VerifyStream = require('./lib/verify-stream');

// List of supported algorithms
var ALGORITHMS = [
  'HS256', 'HS384', 'HS512',
  'RS256', 'RS384', 'RS512',
  'PS256', 'PS384', 'PS512',
  'ES256', 'ES384', 'ES512'
];

// Export the list of algorithms
exports.ALGORITHMS = ALGORITHMS;

// Export functions related to signing and verifying streams
exports.sign = SignStream.sign; // Sign data
exports.verify = VerifyStream.verify; // Verify data
exports.decode = VerifyStream.decode; // Decode data
exports.isValid = VerifyStream.isValid; // Check validity of data

// Export factory functions to create new instances of SignStream and VerifyStream
exports.createSign = function createSign(opts) {
  return new SignStream(opts); // Create a new SignStream object
};
exports.createVerify = function createVerify(opts) {
  return new VerifyStream(opts); // Create a new VerifyStream object
};
