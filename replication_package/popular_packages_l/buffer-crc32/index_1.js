// buffer-crc32.js
const crcTable = [];

(function initializeCrcTable() {
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }
})();

function calculateCrc32(input, initialCrc = 0) {
  let buffer = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  let crc = ~initialCrc;
  for (let byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return Buffer.from([~crc >>> 24 & 0xff, ~crc >>> 16 & 0xff, ~crc >>> 8 & 0xff, ~crc & 0xff]);
}

calculateCrc32.signed = function(input) {
  const crcBuffer = calculateCrc32(input);
  return crcBuffer.readInt32BE(0);
};

calculateCrc32.unsigned = function(input) {
  const crcBuffer = calculateCrc32(input);
  return crcBuffer.readUInt32BE(0);
};

module.exports = calculateCrc32;
