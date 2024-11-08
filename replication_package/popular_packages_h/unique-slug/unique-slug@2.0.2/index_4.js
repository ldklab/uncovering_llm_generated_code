'use strict';
const MurmurHash3 = require('imurmurhash');

module.exports = function generateHash(uniq) {
  if (uniq) {
    const hash = new MurmurHash3(uniq);
    const hashHexString = hash.result().toString(16);
    return hashHexString.padStart(8, '0').slice(-8);
  } else {
    return (Math.random().toString(16).padEnd(8, '0')).slice(2, 10);
  }
};
