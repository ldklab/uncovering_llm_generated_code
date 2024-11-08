const crypto = require('crypto');

function sign(val, secret) {
  if (typeof val !== 'string') throw new TypeError("Cookie value must be provided as a string.");
  if (secret == null) throw new TypeError("Secret key must be provided.");
  
  const hmac = crypto.createHmac('sha256', secret);
  const signature = hmac.update(val).digest('base64').replace(/=+$/, '');
  
  return `${val}.${signature}`;
}

function unsign(input, secret) {
  if (typeof input !== 'string') throw new TypeError("Signed cookie string must be provided.");
  if (secret == null) throw new TypeError("Secret key must be provided.");
  
  const lastDotIndex = input.lastIndexOf('.');
  if (lastDotIndex === -1) return false;
  
  const tentativeValue = input.slice(0, lastDotIndex);
  const expectedInput = sign(tentativeValue, secret);
  
  const expectedBuffer = Buffer.from(expectedInput);
  const inputBuffer = Buffer.from(input);
  
  if (expectedBuffer.length !== inputBuffer.length) return false;
  
  return crypto.timingSafeEqual(expectedBuffer, inputBuffer) ? tentativeValue : false;
}

exports.sign = sign;
exports.unsign = unsign;
