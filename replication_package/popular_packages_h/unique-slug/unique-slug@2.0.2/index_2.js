'use strict';
const MurmurHash3 = require('imurmurhash');

module.exports = function generateHashOrRandomString(uniqValue) {
  if (uniqValue) {
    const hash = new MurmurHash3(uniqValue);
    return hash.result().toString(16).padStart(8, '0').slice(-8);
  } else {
    return Math.random().toString(16).slice(2, 10).padEnd(8, '0');
  }
};
