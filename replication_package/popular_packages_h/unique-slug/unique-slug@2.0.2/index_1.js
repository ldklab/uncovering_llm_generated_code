'use strict';
const MurmurHash3 = require('imurmurhash');

module.exports = function generateHash(uniq) {
  if (uniq) {
    const hash = new MurmurHash3(uniq);
    // Compute the hex hash and ensure it's 8 characters long by padding with zeros
    return hash.result().toString(16).padStart(8, '0');
  } else {
    // Generate a random 8-character long hexadecimal string
    return Math.random().toString(16).slice(2, 10);
  }
};
