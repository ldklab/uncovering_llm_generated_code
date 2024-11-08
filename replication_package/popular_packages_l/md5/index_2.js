// MD5 hash implementation in JavaScript

const crypto = require('crypto');

/**
 * Computes the MD5 hash of the given input.
 * @param {string|Buffer|Array|Uint8Array} message - The input message to hash.
 * @returns {string} - The MD5 hash of the input as a hex string.
 */
function computeMd5Hash(message) {
    // Ensure the input is a Buffer
    const inputBuffer = Buffer.isBuffer(message) ? message : Buffer.from(message);
    
    // Initialize MD5 hash computation
    const md5Hash = crypto.createHash('md5');
    md5Hash.update(inputBuffer);
    
    // Return the computed hash as a hex string
    return md5Hash.digest('hex');
}

module.exports = computeMd5Hash;

// Usage example
// const computeMd5Hash = require('./md5');

// Example 1: Hashing a string
// console.log(computeMd5Hash('message')); // Outputs: 78e731027d8fd50ed642340b7c9a63b3

// Example 2: Hashing a file buffer
// const fs = require('fs');
// fs.readFile('example.txt', function(err, buf) {
//     if (err) throw err;
//     console.log(computeMd5Hash(buf)); // Outputs the MD5 hash of the file's content
// });
