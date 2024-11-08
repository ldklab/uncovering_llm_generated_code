const SignStream = require('./lib/sign-stream');
const VerifyStream = require('./lib/verify-stream');

const ALGORITHMS = [
  'HS256', 'HS384', 'HS512',
  'RS256', 'RS384', 'RS512',
  'PS256', 'PS384', 'PS512',
  'ES256', 'ES384', 'ES512'
];

module.exports = {
  ALGORITHMS,
  sign: SignStream.sign,
  verify: VerifyStream.verify,
  decode: VerifyStream.decode,
  isValid: VerifyStream.isValid,
  createSign: function createSign(opts) {
    return new SignStream(opts);
  },
  createVerify: function createVerify(opts) {
    return new VerifyStream(opts);
  }
};
