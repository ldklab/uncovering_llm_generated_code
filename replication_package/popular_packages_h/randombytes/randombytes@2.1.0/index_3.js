const crypto = require('crypto');

function getRandomBytes(size, callback) {
  return crypto.randomBytes(size, callback);
}

module.exports = getRandomBytes;
