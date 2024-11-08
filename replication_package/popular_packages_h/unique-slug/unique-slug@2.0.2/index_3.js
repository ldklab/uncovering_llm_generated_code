'use strict'
const MurmurHash3 = require('imurmurhash');

module.exports = function generateHash(uniq) {
  if (uniq) {
    const hashGenerator = new MurmurHash3(uniq);
    const hash = hashGenerator.result().toString(16);
    return hash.padStart(8, '0').slice(-8);
  } else {
    const randomHex = Math.random().toString(16) + '0000000';
    return randomHex.slice(2, 10);
  }
}
