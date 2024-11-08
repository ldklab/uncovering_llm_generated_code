// buffer-crc32.js
const crcTable = [];

function makeCrcTable() {
  let c;
  for(let n = 0; n < 256; n++) {
    c = n;
    for(let k = 0; k < 8; k++) {
      if(c & 1) {
        c = 0xEDB88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    crcTable[n] = c;
  }
}

makeCrcTable();

function crc32(buf, previous = 0) {
  if (typeof buf === 'string') {
    buf = Buffer.from(buf, 'utf8');
  }

  let crc = ~previous;
  for (let byte of buf) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return Buffer.from([~crc >> 24 & 0xff, ~crc >> 16 & 0xff, ~crc >> 8 & 0xff, ~crc & 0xff]);
}

crc32.signed = function(buf) {
  const buffer = crc32(buf);
  return buffer.readInt32BE(0);
};

crc32.unsigned = function(buf) {
  const buffer = crc32(buf);
  return buffer.readUInt32BE(0);
};

module.exports = crc32;
