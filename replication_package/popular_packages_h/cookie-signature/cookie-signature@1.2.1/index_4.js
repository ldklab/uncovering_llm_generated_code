const crypto = require('crypto');

/**
 * Sign the given value with a secret key.
 * 
 * @param {string} val - The value to be signed.
 * @param {string|NodeJS.ArrayBufferView|crypto.KeyObject} secret - The secret key for signing.
 * @returns {string} - Returns the signed value.
 */
exports.sign = function(val, secret) {
  if (typeof val !== 'string') {
    throw new TypeError("Cookie value must be provided as a string.");
  }
  if (secret == null) {
    throw new TypeError("Secret key must be provided.");
  }
  
  const hmac = crypto.createHmac('sha256', secret);
  const signature = hmac.update(val).digest('base64').replace(/=+$/, '');
  
  return `${val}.${signature}`;
};

/**
 * Unsign the given value with a secret key.
 * 
 * @param {string} input - The signed input to verify.
 * @param {string|NodeJS.ArrayBufferView|crypto.KeyObject} secret - The secret key for verification.
 * @returns {string|boolean} - Returns the original value if the signature matches, otherwise false.
 */
exports.unsign = function(input, secret) {
  if (typeof input !== 'string') {
    throw new TypeError("Signed cookie string must be provided.");
  }
  if (secret == null) {
    throw new TypeError("Secret key must be provided.");
  }
  
  const separatorIndex = input.lastIndexOf('.');
  const tentativeValue = input.slice(0, separatorIndex);
  const expected = exports.sign(tentativeValue, secret);
  
  const expectedBuffer = Buffer.from(expected);
  const inputBuffer = Buffer.from(input);
  
  const signatureValid = expectedBuffer.length === inputBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, inputBuffer);
    
  return signatureValid ? tentativeValue : false;
};
