// crc32.js
const crc32Table = new Uint32Array(256);

// Fill the CRC table for all 256 possible byte values
for (let i = 0; i < 256; i++) {
  let crc = i;
  for (let j = 0; j < 8; j++) {
    crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
  }
  crc32Table[i] = crc;
}

// Function to compute CRC-32 checksum
function computeCrc32(input, previous = 0) {
  let buffer = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf8');
  let crc = ~previous >>> 0;

  for (const byte of buffer) {
    crc = crc32Table[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
  }

  crc = ~crc >>> 0;
  const result = Buffer.alloc(4);
  result.writeUInt32BE(crc, 0);
  return result;
}

// Extend the computeCrc32 function with additional methods
computeCrc32.signed = function(input) {
  return computeCrc32(input).readInt32BE(0);
};

computeCrc32.unsigned = function(input) {
  return computeCrc32(input).readUInt32BE(0);
};

module.exports = computeCrc32;
