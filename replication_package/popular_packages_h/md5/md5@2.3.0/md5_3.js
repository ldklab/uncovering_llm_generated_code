(() => {
  const crypt = require('crypt');
  const { utf8, bin } = require('charenc');
  const isBuffer = require('is-buffer');
  
  const md5 = (message, options) => {
    // Normalize message to byte array
    if (typeof message === 'string') {
      message = options && options.encoding === 'binary' 
        ? bin.stringToBytes(message) 
        : utf8.stringToBytes(message);
    } else if (isBuffer(message)) {
      message = Array.from(message);
    } else if (!Array.isArray(message) && !(message instanceof Uint8Array)) {
      message = utf8.stringToBytes(message.toString());
    }

    let m = crypt.bytesToWords(message);
    const l = message.length * 8;

    // Initialize hash values
    let [a, b, c, d] = [1732584193, -271733879, -1732584194, 271733878];

    // Swap endian at each word
    for (let i = 0; i < m.length; i++) {
      m[i] = ((m[i] << 8) | (m[i] >>> 24)) & 0x00FF00FF |
             ((m[i] << 24) | (m[i] >>> 8)) & 0xFF00FF00;
    }

    // Padding
    m[l >>> 5] |= 0x80 << (l % 32);
    m[((l + 64 >>> 9) << 4) + 14] = l;

    // MD5 message processing
    for (let i = 0; i < m.length; i += 16) {
      const [aa, bb, cc, dd] = [a, b, c, d];

      a = md5._ff(a, b, c, d, m[i + 0], 7, -680876936);
      d = md5._ff(d, a, b, c, m[i + 1], 12, -389564586);
      c = md5._ff(c, d, a, b, m[i + 2], 17, 606105819);
      b = md5._ff(b, c, d, a, m[i + 3], 22, -1044525330);
      a = md5._ff(a, b, c, d, m[i + 4], 7, -176418897);
      d = md5._ff(d, a, b, c, m[i + 5], 12, 1200080426);
      c = md5._ff(c, d, a, b, m[i + 6], 17, -1473231341);
      b = md5._ff(b, c, d, a, m[i + 7], 22, -45705983);
      a = md5._ff(a, b, c, d, m[i + 8], 7, 1770035416);
      d = md5._ff(d, a, b, c, m[i + 9], 12, -1958414417);
      c = md5._ff(c, d, a, b, m[i + 10], 17, -42063);
      b = md5._ff(b, c, d, a, m[i + 11], 22, -1990404162);
      a = md5._ff(a, b, c, d, m[i + 12], 7, 1804603682);
      d = md5._ff(d, a, b, c, m[i + 13], 12, -40341101);
      c = md5._ff(c, d, a, b, m[i + 14], 17, -1502002290);
      b = md5._ff(b, c, d, a, m[i + 15], 22, 1236535329);

      a = md5._gg(a, b, c, d, m[i + 1], 5, -165796510);
      d = md5._gg(d, a, b, c, m[i + 6], 9, -1069501632);
      c = md5._gg(c, d, a, b, m[i + 11], 14, 643717713);
      b = md5._gg(b, c, d, a, m[i + 0], 20, -373897302);
      a = md5._gg(a, b, c, d, m[i + 5], 5, -701558691);
      d = md5._gg(d, a, b, c, m[i + 10], 9, 38016083);
      c = md5._gg(c, d, a, b, m[i + 15], 14, -660478335);
      b = md5._gg(b, c, d, a, m[i + 4], 20, -405537848);
      a = md5._gg(a, b, c, d, m[i + 9], 5, 568446438);
      d = md5._gg(d, a, b, c, m[i + 14], 9, -1019803690);
      c = md5._gg(c, d, a, b, m[i + 3], 14, -187363961);
      b = md5._gg(b, c, d, a, m[i + 8], 20, 1163531501);
      a = md5._gg(a, b, c, d, m[i + 13], 5, -1444681467);
      d = md5._gg(d, a, b, c, m[i + 2], 9, -51403784);
      c = md5._gg(c, d, a, b, m[i + 7], 14, 1735328473);
      b = md5._gg(b, c, d, a, m[i + 12], 20, -1926607734);

      a = md5._hh(a, b, c, d, m[i + 5], 4, -378558);
      d = md5._hh(d, a, b, c, m[i + 8], 11, -2022574463);
      c = md5._hh(c, d, a, b, m[i + 11], 16, 1839030562);
      b = md5._hh(b, c, d, a, m[i + 14], 23, -35309556);
      a = md5._hh(a, b, c, d, m[i + 1], 4, -1530992060);
      d = md5._hh(d, a, b, c, m[i + 4], 11, 1272893353);
      c = md5._hh(c, d, a, b, m[i + 7], 16, -155497632);
      b = md5._hh(b, c, d, a, m[i + 10], 23, -1094730640);
      a = md5._hh(a, b, c, d, m[i + 13], 4, 681279174);
      d = md5._hh(d, a, b, c, m[i + 0], 11, -358537222);
      c = md5._hh(c, d, a, b, m[i + 3], 16, -722521979);
      b = md5._hh(b, c, d, a, m[i + 6], 23, 76029189);
      a = md5._hh(a, b, c, d, m[i + 9], 4, -640364487);
      d = md5._hh(d, a, b, c, m[i + 12], 11, -421815835);
      c = md5._hh(c, d, a, b, m[i + 15], 16, 530742520);
      b = md5._hh(b, c, d, a, m[i + 2], 23, -995338651);

      a = md5._ii(a, b, c, d, m[i + 0], 6, -198630844);
      d = md5._ii(d, a, b, c, m[i + 7], 10, 1126891415);
      c = md5._ii(c, d, a, b, m[i + 14], 15, -1416354905);
      b = md5._ii(b, c, d, a, m[i + 5], 21, -57434055);
      a = md5._ii(a, b, c, d, m[i + 12], 6, 1700485571);
      d = md5._ii(d, a, b, c, m[i + 3], 10, -1894986606);
      c = md5._ii(c, d, a, b, m[i + 10], 15, -1051523);
      b = md5._ii(b, c, d, a, m[i + 1], 21, -2054922799);
      a = md5._ii(a, b, c, d, m[i + 8], 6, 1873313359);
      d = md5._ii(d, a, b, c, m[i + 15], 10, -30611744);
      c = md5._ii(c, d, a, b, m[i + 6], 15, -1560198380);
      b = md5._ii(b, c, d, a, m[i + 13], 21, 1309151649);
      a = md5._ii(a, b, c, d, m[i + 4], 6, -145523070);
      d = md5._ii(d, a, b, c, m[i + 11], 10, -1120210379);
      c = md5._ii(c, d, a, b, m[i + 2], 15, 718787259);
      b = md5._ii(b, c, d, a, m[i + 9], 21, -343485551);

      a = (a + aa) >>> 0;
      b = (b + bb) >>> 0;
      c = (c + cc) >>> 0;
      d = (d + dd) >>> 0;
    }

    return crypt.endian([a, b, c, d]);
  };

  md5._ff = (a, b, c, d, x, s, t) => (((a + ((b & c) | (~b & d)) + (x >>> 0) + t) << s) | (((a + ((b & c) | (~b & d)) + (x >>> 0) + t) >>> (32 - s))) + b;
  md5._gg = (a, b, c, d, x, s, t) => (((a + ((b & d) | (c & ~d)) + (x >>> 0) + t) << s) | (((a + ((b & d) | (c & ~d)) + (x >>> 0) + t) >>> (32 - s))) + b;
  md5._hh = (a, b, c, d, x, s, t) => (((a + (b ^ c ^ d) + (x >>> 0) + t) << s) | (((a + (b ^ c ^ d) + (x >>> 0) + t) >>> (32 - s))) + b;
  md5._ii = (a, b, c, d, x, s, t) => (((a + (c ^ (b | ~d)) + (x >>> 0) + t) << s) | (((a + (c ^ (b | ~d)) + (x >>> 0) + t) >>> (32 - s))) + b;

  md5._blocksize = 16;
  md5._digestsize = 16;

  module.exports = (message, options) => {
    if (message == null) throw new Error('Illegal argument ' + message);
    const digestBytes = crypt.wordsToBytes(md5(message, options));
    return options?.asBytes ? digestBytes 
         : options?.asString ? bin.bytesToString(digestBytes) 
         : crypt.bytesToHex(digestBytes);
  };
})();
