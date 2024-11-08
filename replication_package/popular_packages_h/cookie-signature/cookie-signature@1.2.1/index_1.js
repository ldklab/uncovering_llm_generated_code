const crypto = require('crypto');

exports.sign = function(val, secret) {
  if (typeof val !== 'string') throw new TypeError("Cookie value must be provided as a string.");
  if (secret == null) throw new TypeError("Secret key must be provided.");
  const signature = crypto.createHmac('sha256', secret)
                          .update(val)
                          .digest('base64')
                          .replace(/=+$/, '');
  return `${val}.${signature}`;
};

exports.unsign = function(input, secret) {
  if (typeof input !== 'string') throw new TypeError("Signed cookie string must be provided.");
  if (secret == null) throw new TypeError("Secret key must be provided.");
  const index = input.lastIndexOf('.');
  const tentativeValue = input.slice(0, index);
  const expectedInput = exports.sign(tentativeValue, secret);
  const expectedBuffer = Buffer.from(expectedInput);
  const inputBuffer = Buffer.from(input);
  const isValid = expectedBuffer.length === inputBuffer.length &&
                  crypto.timingSafeEqual(expectedBuffer, inputBuffer);
  return isValid ? tentativeValue : false;
};
