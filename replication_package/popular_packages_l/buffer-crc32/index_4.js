const CRC_TABLE = new Array(256);

function generateCRCTable() {
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    CRC_TABLE[n] = c;
  }
}

generateCRCTable();

function crc32(input, previous = 0) {
  let buf = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf8');
  let crc = ~previous;

  for (const byte of buf) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  crc = ~crc;
  return Buffer.from([crc >>> 24, crc >>> 16, crc >>> 8, crc].map(b => b & 0xff));
}

crc32.signed = input => crc32(input).readInt32BE(0);

crc32.unsigned = input => crc32(input).readUInt32BE(0);

module.exports = crc32;
