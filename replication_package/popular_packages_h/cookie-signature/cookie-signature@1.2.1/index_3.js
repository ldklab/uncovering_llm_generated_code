const crypto = require('crypto');

/**
 * Sign the given `val` with `secret`.
 *
 * @param {string} val
 * @param {string|NodeJS.ArrayBufferView|crypto.KeyObject} secret
 * @returns {string}
 * @throws {TypeError} if `val` is not a string or `secret` is null
 */
function sign(val, secret) {
  if (typeof val !== 'string') {
    throw new TypeError("Cookie value must be provided as a string.");
  }
  if (secret == null) {
    throw new TypeError("Secret key must be provided.");
  }

  const hmac = crypto.createHmac('sha256', secret);
  const signature = hmac.update(val).digest('base64').replace(/\=+$/, '');
  return `${val}.${signature}`;
}

/**
 * Unsign and decode the given `input` with `secret`,
 * returning `false` if the signature is invalid.
 *
 * @param {string} input
 * @param {string|NodeJS.ArrayBufferView|crypto.KeyObject} secret
 * @returns {string|boolean}
 * @throws {TypeError} if `input` is not a string or `secret` is null
 */
function unsign(input, secret) {
  if (typeof input !== 'string') {
    throw new TypeError("Signed cookie string must be provided.");
  }
  if (secret == null) {
    throw new TypeError("Secret key must be provided.");
  }

  const lastDotIndex = input.lastIndexOf('.');
  const tentativeValue = input.slice(0, lastDotIndex);

  const expectedInput = sign(tentativeValue, secret);
  const expectedBuffer = Buffer.from(expectedInput);
  const inputBuffer = Buffer.from(input);

  const isSignatureValid = expectedBuffer.length === inputBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, inputBuffer);

  return isSignatureValid ? tentativeValue : false;
}

module.exports = { sign, unsign };
