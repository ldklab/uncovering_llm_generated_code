// crc32.js
class CRC32 {
  constructor() {
    this.crcTable = this.makeCrcTable();
  }

  makeCrcTable() {
    const table = new Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[n] = c;
    }
    return table;
  }

  compute(buf, previous = 0) {
    if (typeof buf === 'string') {
      buf = Buffer.from(buf, 'utf8');
    }

    let crc = ~previous;
    for (let byte of buf) {
      crc = this.crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    }

    crc = ~crc;
    return Buffer.from([(crc >> 24) & 0xff, (crc >> 16) & 0xff, (crc >> 8) & 0xff, crc & 0xff]);
  }

  signed(buf) {
    return this.compute(buf).readInt32BE(0);
  }

  unsigned(buf) {
    return this.compute(buf).readUInt32BE(0);
  }
}

const crc32Instance = new CRC32();

module.exports = {
  compute: (buf, previous) => crc32Instance.compute(buf, previous),
  signed: (buf) => crc32Instance.signed(buf),
  unsigned: (buf) => crc32Instance.unsigned(buf),
};
