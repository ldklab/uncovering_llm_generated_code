const { lstatSync, fstatSync } = require('fs');

// Define the calculateBodyLength function
function calculateBodyLength(body) {
  if (!body) {
    return 0;
  }
  if (typeof body === 'string') {
    return Buffer.byteLength(body);
  } else if (typeof body.byteLength === 'number') {
    return body.byteLength;
  } else if (typeof body.size === 'number') {
    return body.size;
  } else if (typeof body.start === 'number' && typeof body.end === 'number') {
    return body.end + 1 - body.start;
  } else if (typeof body.path === 'string' || Buffer.isBuffer(body.path)) {
    return lstatSync(body.path).size;
  } else if (typeof body.fd === 'number') {
    return fstatSync(body.fd).size;
  }
  throw new Error(`Body Length computation failed for ${body}`);
}

// Export the calculateBodyLength function using CommonJS
module.exports = {
  calculateBodyLength
};
