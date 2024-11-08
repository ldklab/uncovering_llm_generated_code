const { Buffer } = require('buffer');

let CRC_TABLE = [
  // Precomputed CRC table values (truncated for brevity)
];

if (typeof Int32Array !== 'undefined') {
  CRC_TABLE = new Int32Array(CRC_TABLE);
}

function ensureBuffer(input) {
  if (Buffer.isBuffer(input)) return input;
  
  const bufferMethodsAvailable = typeof Buffer.alloc === "function" && typeof Buffer.from === "function";
  
  if (typeof input === "number") return bufferMethodsAvailable ? Buffer.alloc(input) : new Buffer(input);
  if (typeof input === "string") return bufferMethodsAvailable ? Buffer.from(input) : new Buffer(input);
  
  throw new Error(`Invalid input type: ${typeof input}. Must be buffer, number, or string.`);
}

function bufferizeInt(num) {
  const buffer = ensureBuffer(4);
  buffer.writeInt32BE(num, 0);
  return buffer;
}

function _crc32(buf, previous = 0) {
  buf = ensureBuffer(buf);
  if (Buffer.isBuffer(previous)) previous = previous.readUInt32BE(0);
  
  let crc = (previous ^ -1) >>> 0;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8) >>> 0;
  }
  
  return crc ^ -1;
}

function crc32(...args) {
  return bufferizeInt(_crc32(...args));
}

crc32.signed = (...args) => _crc32(...args);
crc32.unsigned = (...args) => _crc32(...args) >>> 0;

module.exports = crc32;
