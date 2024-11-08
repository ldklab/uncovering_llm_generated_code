const { Buffer } = require('buffer');

let CRC_TABLE = [
  0x00000000, 0x77073096, 0xee0e612c, 0x990951ba, 0x076dc419,
  // ... rest of the table ...
  0x5a05df1b, 0x2d02ef8d
];

if (typeof Int32Array !== 'undefined') {
  CRC_TABLE = new Int32Array(CRC_TABLE);
}

function ensureBuffer(input) {
  if (Buffer.isBuffer(input)) return input;

  const hasNewBufferAPI = typeof Buffer.alloc === 'function' && typeof Buffer.from === 'function';

  if (typeof input === 'number') {
    return hasNewBufferAPI ? Buffer.alloc(input) : new Buffer(input);
  } else if (typeof input === 'string') {
    return hasNewBufferAPI ? Buffer.from(input) : new Buffer(input);
  } else {
    throw new TypeError(`input must be buffer, number, or string, received ${typeof input}`);
  }
}

function bufferizeInt(num) {
  const tmp = ensureBuffer(4);
  tmp.writeInt32BE(num, 0);
  return tmp;
}

function _crc32(buf, previous = 0) {
  buf = ensureBuffer(buf);
  if (Buffer.isBuffer(previous)) {
    previous = previous.readUInt32BE(0);
  }
  let crc = ~previous;
  for (let n = 0; n < buf.length; n++) {
    crc = (CRC_TABLE[(crc ^ buf[n]) & 0xff] ^ (crc >>> 8));
  }
  return crc ^ -1;
}

function crc32(...args) {
  return bufferizeInt(_crc32(...args));
}

crc32.signed = function (...args) {
  return _crc32(...args);
};

crc32.unsigned = function (...args) {
  return _crc32(...args) >>> 0;
};

module.exports = crc32;
