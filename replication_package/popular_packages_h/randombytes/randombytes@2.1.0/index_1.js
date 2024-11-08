const crypto = require('crypto');

function generateRandomBytes(size) {
    return crypto.randomBytes(size);
}

module.exports = generateRandomBytes;
