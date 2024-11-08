markdown
// MD5 hash implementation in JavaScript

const crypto = require('crypto');

/**
 * Computes the MD5 hash of the given input.
 * @param {string|Buffer|Array|Uint8Array} message - The input message to hash.
 * @returns {string} - The MD5 hash of the input as a hex string.
 */
function md5(message) {
    // Convert input to a Buffer if it isn't one already
    if (!Buffer.isBuffer(message)) {
        message = Buffer.from(message);
    }
    // Create MD5 hash using Node.js crypto module
    const hash = crypto.createHash('md5');
    hash.update(message);
    return hash.digest('hex');
}

module.exports = md5;

// Usage example
// const md5 = require('./md5');

// Example 1: Hashing a string
// console.log(md5('message')); // Outputs: 78e731027d8fd50ed642340b7c9a63b3

// Example 2: Hashing a file buffer
// const fs = require('fs');
// fs.readFile('example.txt', function(err, buf) {
//     if (err) throw err;
//     console.log(md5(buf)); // Outputs the MD5 hash of the file's content
// });
