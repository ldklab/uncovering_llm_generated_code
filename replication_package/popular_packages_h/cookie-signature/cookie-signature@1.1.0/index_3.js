const { createHmac, timingSafeEqual } = require('crypto');

/**
 * Generate HMAC signature for given value with provided secret
 *
 * @param {String} val - Value to sign
 * @param {String} secret - Secret key for signing
 * @returns {String} Signed value
 * @throws {TypeError} if val or secret are not strings
 */
function sign(val, secret) {
  if (typeof val !== 'string') throw new TypeError("Cookie value must be provided as a string.");
  if (typeof secret !== 'string') throw new TypeError("Secret string must be provided.");

  const signature = createHmac('sha256', secret)
    .update(val)
    .digest('base64')
    .replace(/=+$/, '');

  return `${val}.${signature}`;
}

/**
 * Verify and decode signed value with provided secret
 *
 * @param {String} val - Signed value to verify
 * @param {String} secret - Secret key for verification
 * @returns {String|Boolean} Original value if valid signature, otherwise false
 * @throws {TypeError} if val or secret are not strings
 */
function unsign(val, secret) {
  if (typeof val !== 'string') throw new TypeError("Signed cookie string must be provided.");
  if (typeof secret !== 'string') throw new TypeError("Secret string must be provided.");

  const originalValue = val.slice(0, val.lastIndexOf('.'));
  const expectedSignature = sign(originalValue, secret);

  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.alloc(expectedBuffer.length);
  actualBuffer.write(val);

  return timingSafeEqual(expectedBuffer, actualBuffer) ? originalValue : false;
}

module.exports = { sign, unsign };
