const crypto = require('crypto');

/**
 * Sign the given `val` with `secret`.
 *
 * @param {string} val - The value to sign.
 * @param {string} secret - The secret key for signing.
 * @returns {string} - The signed value.
 * @throws {TypeError} - If `val` or `secret` is not a string.
 * @api private
 */
exports.sign = (val, secret) => {
  if (typeof val !== 'string') throw new TypeError("Cookie value must be provided as a string.");
  if (typeof secret !== 'string') throw new TypeError("Secret string must be provided.");

  const hmac = crypto.createHmac('sha256', secret)
                      .update(val)
                      .digest('base64')
                      .replace(/=+$/, '');

  return `${val}.${hmac}`;
};

/**
 * Unsign and decode the given `val` with `secret`,
 * returning `false` if the signature is invalid.
 *
 * @param {string} val - The value to unsign.
 * @param {string} secret - The secret key for unsigning.
 * @returns {string|boolean} - The original value if valid, otherwise `false`.
 * @throws {TypeError} - If `val` or `secret` is not a string.
 * @api private
 */
exports.unsign = (val, secret) => {
  if (typeof val !== 'string') throw new TypeError("Signed cookie string must be provided.");
  if (typeof secret !== 'string') throw new TypeError("Secret string must be provided.");

  const originalValue = val.slice(0, val.lastIndexOf('.'));
  const signature = exports.sign(originalValue, secret);
  const signatureBuffer = Buffer.from(signature);
  const valueBuffer = Buffer.alloc(signatureBuffer.length, val);

  return crypto.timingSafeEqual(signatureBuffer, valueBuffer) ? originalValue : false;
};
