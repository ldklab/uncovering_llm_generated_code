const crypt = require('crypt');
const { utf8, bin } = require('charenc');
const isBuffer = require('is-buffer');

// MD5 hashing function
function md5(message, options) {
  // Convert message to byte array
  if (typeof message === 'string') {
    message = options && options.encoding === 'binary'
      ? bin.stringToBytes(message)
      : utf8.stringToBytes(message);
  } else if (isBuffer(message)) {
    message = Array.from(message);
  } else if (!Array.isArray(message) && !(message instanceof Uint8Array)) {
    message = utf8.stringToBytes(message.toString());
  }

  const m = crypt.bytesToWords(message);
  const l = message.length * 8;

  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  // Endian swap
  for (let i = 0; i < m.length; i++) {
    m[i] = ((m[i] << 8) | (m[i] >>> 24)) & 0x00FF00FF |
           ((m[i] << 24) | (m[i] >>> 8)) & 0xFF00FF00;
  }

  // Padding
  m[l >>> 5] |= 0x80 << (l % 32);
  m[(((l + 64) >>> 9) << 4) + 14] = l;

  // Core transformation
  for (let i = 0; i < m.length; i += 16) {
    const aa = a, bb = b, cc = c, dd = d;

    a = ff(a, b, c, d, m[i+0], 7, -680876936);
    d = ff(d, a, b, c, m[i+1], 12, -389564586);
    // ... (similar transformations continue for all four rounds)
    b = ii(b, c, d, a, m[i+9], 21, -343485551);

    a = (a + aa) >>> 0;
    b = (b + bb) >>> 0;
    c = (c + cc) >>> 0;
    d = (d + dd) >>> 0;
  }

  return crypt.endian([a, b, c, d]);
}

// Auxiliary functions for MD5 transformation
function ff(a, b, c, d, x, s, t) {
  const n = a + ((b & c) | (~b & d)) + (x >>> 0) + t;
  return ((n << s) | (n >>> (32 - s))) + b;
}

function gg(a, b, c, d, x, s, t) {
  const n = a + ((b & d) | (c & ~d)) + (x >>> 0) + t;
  return ((n << s) | (n >>> (32 - s))) + b;
}

function hh(a, b, c, d, x, s, t) {
  const n = a + (b ^ c ^ d) + (x >>> 0) + t;
  return ((n << s) | (n >>> (32 - s))) + b;
}

function ii(a, b, c, d, x, s, t) {
  const n = a + (c ^ (b | ~d)) + (x >>> 0) + t;
  return ((n << s) | (n >>> (32 - s))) + b;
}

md5._blocksize = 16;
md5._digestsize = 16;

// Export back to caller
module.exports = function (message, options) {
  if (message === undefined || message === null) {
    throw new Error(`Illegal argument: ${message}`);
  }

  const digestbytes = crypt.wordsToBytes(md5(message, options));
  return options && options.asBytes ? digestbytes :
         options && options.asString ? bin.bytesToString(digestbytes) :
         crypt.bytesToHex(digestbytes);
};
