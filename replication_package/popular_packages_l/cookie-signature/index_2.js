const crypto = require('crypto');

/**
 * Signs a given cookie value using a secret key and returns the signed value.
 * 
 * @param {string} value - The value to be signed.
 * @param {string} secret - The secret key used for signing.
 * @returns {string} - The signed cookie value in the format 'value.signature'.
 */
exports.sign = function(value, secret) {
  const signature = crypto
    .createHmac('sha256', secret) // Create a HMAC with SHA-256 algorithm using the secret.
    .update(value) // Input the value to be signed.
    .digest('base64') // Digest the HMAC result into a base64 string.
    .replace(/=+$/, ''); // Remove any trailing '=' from the base64 string.
  return `${value}.${signature}`; // Concatenate the original value with its signature, separated by a dot.
};

/**
 * Verifies a signed cookie value to check if it matches the original value after using the same secret.
 * 
 * @param {string} signedValue - The signed cookie value to be verified.
 * @param {string} secret - The secret key used for signing.
 * @returns {string|boolean} - Returns the original value if the signature is valid; otherwise, returns false.
 */
exports.unsign = function(signedValue, secret) {
  const lastDot = signedValue.lastIndexOf('.'); // Find the last occurrence of a dot separator.
  if (lastDot === -1) return false; // If no dot is found, return false, as it is not a correctly signed value.

  const value = signedValue.slice(0, lastDot); // Extract the original value before the dot.
  const signature = signedValue.slice(lastDot + 1); // Extract the signature after the dot.

  const expectedSignature = crypto
    .createHmac('sha256', secret) // Recreate the HMAC using the secret and extracted value.
    .update(value)
    .digest('base64')
    .replace(/=+$/, '');

  return signature === expectedSignature ? value : false; // Compare the actual and expected signatures to validate.
};
