const crypto = require('crypto');

/**
 * Generates a signed cookie value given a cookie value and a secret.
 * 
 * @param {string} value - The value to sign.
 * @param {string} secret - The secret key for signing.
 * @returns {string} - The signed value.
 */
exports.sign = function(value, secret) {
  const signature = crypto
    .createHmac('sha256', secret)
    .update(value)
    .digest('base64')
    .replace(/=+$/, ''); // Remove any trailing '=' characters
  return `${value}.${signature}`;
};

/**
 * Unsigns and verifies a signed cookie value.
 * 
 * @param {string} signedValue - The signed value.
 * @param {string} secret - The secret key for signing.
 * @returns {string|boolean} - The original value if valid; otherwise false.
 */
exports.unsign = function(signedValue, secret) {
  const lastDot = signedValue.lastIndexOf('.');
  if (lastDot === -1) return false;

  const value = signedValue.slice(0, lastDot);
  const signature = signedValue.slice(lastDot + 1);

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(value)
    .digest('base64')
    .replace(/=+$/, '');

  return signature === expectedSignature ? value : false;
};
