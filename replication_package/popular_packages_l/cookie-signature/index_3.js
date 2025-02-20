const crypto = require('crypto');

/**
 * Generates a signed cookie value given a cookie value and a secret.
 * 
 * @param {string} value - The value to sign.
 * @param {string} secret - The secret key for signing.
 * @returns {string} - The signed value.
 */
exports.sign = function(value, secret) {
  const hash = crypto.createHmac('sha256', secret);
  const signature = hash.update(value).digest('base64').replace(/=+$/, '');
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
  const lastDotIndex = signedValue.lastIndexOf('.');
  
  if (lastDotIndex === -1) return false;

  const originalValue = signedValue.substring(0, lastDotIndex);
  const providedSignature = signedValue.substring(lastDotIndex + 1);

  const hash = crypto.createHmac('sha256', secret);
  const expectedSignature = hash.update(originalValue).digest('base64').replace(/=+$/, '');

  return providedSignature === expectedSignature ? originalValue : false;
};
