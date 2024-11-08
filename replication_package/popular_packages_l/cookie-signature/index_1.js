const crypto = require('crypto');

/**
 * Generates a signed cookie value given a cookie value and a secret.
 * 
 * @param {string} value - The value to sign.
 * @param {string} secret - The secret key for signing.
 * @returns {string} - The signed value.
 */
exports.sign = function(value, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(value);
  const signature = hmac.digest('base64').replace(/=+$/, '');
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
  const parts = signedValue.split('.');
  if (parts.length < 2) return false;

  const value = parts.slice(0, -1).join('.');
  const providedSignature = parts[parts.length - 1];

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(value);
  const validSignature = hmac.digest('base64').replace(/=+$/, '');

  return providedSignature === validSignature ? value : false;
};
