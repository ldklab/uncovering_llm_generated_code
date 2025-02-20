// MD5 hash implementation in JavaScript using the crypto module

const crypto = require('crypto');

/**
 * Computes the MD5 hash of the given input.
 * @param {string|Buffer|Array|Uint8Array} input - The input data to hash.
 * @returns {string} - The MD5 hash of the input as a hexadecimal string.
 */
function computeMd5Hash(input) {
    // Ensure the input data is in Buffer format
    if (!Buffer.isBuffer(input)) {
        input = Buffer.from(input);
    }
    
    // Generate MD5 hash using the crypto library
    const md5Hash = crypto.createHash('md5');
    md5Hash.update(input);
    
    // Return the resulting hash as a hex string
    return md5Hash.digest('hex');
}

module.exports = computeMd5Hash;

// Sample usage

// Usage 1: Hashing a simple string
// console.log(computeMd5Hash('example')); // Expected: 1a79a4d60de6718e8e5b326e338ae533

// Usage 2: Hashing the contents of a file
// const fs = require('fs');
// fs.readFile('sample.txt', (error, buffer) => {
//     if (error) throw error;
//     console.log(computeMd5Hash(buffer)); // Outputs the MD5 hash of the file contents
// });
