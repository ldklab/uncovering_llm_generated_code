// MD5 hash implementation in JavaScript

const crypto = require('crypto');

/**
 * Computes the MD5 hash of the given input.
 * @param {string|Buffer|Array|Uint8Array} message - The input message to hash.
 * @returns {string} - The MD5 hash of the input as a hex string.
 */
function computeMD5Hash(message) {
    // Convert input to a Buffer if necessary
    const inputBuffer = Buffer.isBuffer(message) ? message : Buffer.from(message);
    
    // Create an MD5 hash and update it with the input
    const hash = crypto.createHash('md5');
    hash.update(inputBuffer);
    
    // Return the computed hash as a hexadecimal string
    return hash.digest('hex');
}

module.exports = computeMD5Hash;

// Usage examples:
// const computeMD5Hash = require('./md5');

// Example 1: Hashing a string
// console.log(computeMD5Hash('message')); // Outputs: 78e731027d8fd50ed642340b7c9a63b3

// Example 2: Hashing a file buffer
// const fs = require('fs');
// fs.readFile('example.txt', (err, buf) => {
//     if (err) throw err;
//     console.log(computeMD5Hash(buf)); // Outputs the MD5 hash of the file's content
// });
