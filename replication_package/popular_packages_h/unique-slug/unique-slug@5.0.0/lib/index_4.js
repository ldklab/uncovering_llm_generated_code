'use strict';
const MurmurHash3 = require('imurmurhash');

function generateHash(uniq) {
  if (uniq) {
    const hash = new MurmurHash3(uniq);
    return ('00000000' + hash.result().toString(16)).slice(-8);
  } else {
    return (Math.random().toString(16) + '0000000').slice(2, 10);
  }
}

module.exports = generateHash;
