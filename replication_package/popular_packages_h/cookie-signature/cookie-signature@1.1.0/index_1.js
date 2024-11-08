const crypto = require('crypto');

/**
 * Signs the given value with the secret.
 *
 * @param {string} value - The value to sign.
 * @param {string} secret - The secret for signing.
 * @return {string} - The signed value.
 */
exports.sign = function(value, secret) {
  if (typeof value !== 'string') throw new TypeError("Value must be a string.");
  if (typeof secret !== 'string') throw new TypeError("Secret must be a string.");
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(value)
    .digest('base64')
    .replace(/=+$/, '');
  
  return `${value}.${signature}`;
};

/**
 * Unsigns and verifies the signed value with the secret.
 *
 * @param {string} signedValue - The signed value to check.
 * @param {string} secret - The secret to verify against.
 * @return {string|boolean} - The original value if valid, otherwise false.
 */
exports.unsign = function(signedValue, secret) {
  if (typeof signedValue !== 'string') throw new TypeError("Signed value must be a string.");
  if (typeof secret !== 'string') throw new TypeError("Secret must be a string.");

  const lastDotIndex = signedValue.lastIndexOf('.');
  if (lastDotIndex === -1) return false;

  const originalValue = signedValue.slice(0, lastDotIndex);
  const expectedSignature = exports.sign(originalValue, secret);
  
  // Use timing-safe equality check to prevent signature forgery.
  const expectedBuffer = Buffer.from(expectedSignature);
  const inputBuffer = Buffer.from(signedValue);
  
  return crypto.timingSafeEqual(expectedBuffer, inputBuffer) ? originalValue : false;
};
