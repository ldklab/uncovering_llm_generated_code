'use strict';
const MurmurHash3 = require('imurmurhash');

module.exports = function generateIdentifier(uniqueInput) {
  if (uniqueInput) {
    const hashInstance = new MurmurHash3(uniqueInput);
    const hexString = hashInstance.result().toString(16);
    return hexString.padStart(8, '0').slice(-8);
  } else {
    const randomHex = Math.random().toString(16).slice(2, 10);
    return randomHex;
  }
};
