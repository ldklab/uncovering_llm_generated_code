const crypto = require('crypto');

// Function to sign a value with a secret
exports.sign = function(val, secret) {
  if (typeof val !== 'string') throw new TypeError("Cookie value must be provided as a string.");
  if (typeof secret !== 'string') throw new TypeError("Secret string must be provided.");
  
  const signature = crypto.createHmac('sha256', secret)
                          .update(val)
                          .digest('base64')
                          .replace(/\=+$/, '');

  return `${val}.${signature}`;
};

// Function to unsign and verify a signed value
exports.unsign = function(val, secret) {
  if (typeof val !== 'string') throw new TypeError("Signed cookie string must be provided.");
  if (typeof secret !== 'string') throw new TypeError("Secret string must be provided.");
  
  const index = val.lastIndexOf('.');
  if (index === -1) return false;
  
  const originalValue = val.slice(0, index);
  const originalSignature = val.slice(index + 1);
  const computedSignature = exports.sign(originalValue, secret).slice(index + 1);

  const originalBuffer = Buffer.from(originalSignature);
  const computedBuffer = Buffer.from(computedSignature);

  return crypto.timingSafeEqual(originalBuffer, computedBuffer) ? originalValue : false;
};
