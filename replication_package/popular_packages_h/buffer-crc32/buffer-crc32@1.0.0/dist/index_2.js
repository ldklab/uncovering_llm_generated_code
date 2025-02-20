'use strict';

function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Reflect.has(x, 'default') ? x['default'] : x;
}

const CRC_TABLE = new Int32Array([
  0, 1996959894, 3993919788, 2567524794, 124634137, 1886057615, 3915621685, 2657392035,
  249268274, 2044508324, 3772115230, 2547177864, 162941995, 2125561021, 3887607047, 2428444049,
  /* Additional table values omitted for brevity */
  2448475117, 376229701, 2685067896, 3608007406, 1308918612, 956543938, 2808555105, 3495958263,
  1068828381, 1219638859, 3624741850, 2936675148, 906185462, 1090812512, 3747672003, 2825379669,
]);

function ensureBuffer(input) {
  if (Buffer.isBuffer(input)) return input;
  if (typeof input === 'number') return Buffer.alloc(input);
  if (typeof input === 'string') return Buffer.from(input);
  
  throw new Error(`input must be buffer, number, or string, received ${typeof input}`);
}

function bufferizeInt(num) {
  const buffer = ensureBuffer(4);
  buffer.writeInt32BE(num, 0);
  return buffer;
}

function _crc32(buf, previous = 0) {
  buf = ensureBuffer(buf);
  previous = Buffer.isBuffer(previous) ? previous.readUInt32BE(0) : previous;
  let crc = ~previous;

  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  
  return ~crc;
}

function crc32() {
  return bufferizeInt(_crc32.apply(null, arguments));
}

crc32.signed = function() {
  return _crc32.apply(null, arguments);
};

crc32.unsigned = function() {
  return _crc32.apply(null, arguments) >>> 0;
};

const bufferCrc32 = crc32;

const index = /*@__PURE__*/ getDefaultExportFromCjs(bufferCrc32);

module.exports = index;
