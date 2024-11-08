const fs = require('fs');

function calculateBodyLength(body) {
  if (!body) return 0;

  if (typeof body === 'string') return Buffer.byteLength(body);
  if (typeof body.byteLength === 'number') return body.byteLength;
  if (typeof body.size === 'number') return body.size;
  if (typeof body.start === 'number' && typeof body.end === 'number') return body.end + 1 - body.start;

  if (typeof body.path === 'string' || Buffer.isBuffer(body.path)) {
    return fs.lstatSync(body.path).size;
  }

  if (typeof body.fd === 'number') {
    return fs.fstatSync(body.fd).size;
  }

  throw new Error(`Body Length computation failed for ${body}`);
}

module.exports = { calculateBodyLength };
