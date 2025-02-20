// MD5 hash implementation using Node.js crypto module

const crypto = require('crypto');

/**
 * Computes the MD5 hash of the given input.
 * @param {string|Buffer|Array|Uint8Array} input - The input value to be hashed.
 * @returns {string} - Returns the MD5 hash as a hexadecimal string.
 */
function md5(input) {
    // Ensure the input is converted to a Buffer type if it is not already
    if (!Buffer.isBuffer(input)) {
        input = Buffer.from(input);
    }
    // Utilize the crypto module to create an MD5 hash
    const hash = crypto.createHash('md5');
    hash.update(input);
    return hash.digest('hex');
}

module.exports = md5;

// Usage demonstration
// const md5 = require('./md5');

// Example 1: MD5 hash of a string
// console.log(md5('hello world')); // Should output: 5eb63bbbe01eeed093cb22bb8f5acdc3

// Example 2: MD5 hash of a file's buffer
// const fs = require('fs');
// fs.readFile('sample.txt', (err, buffer) => {
//     if (err) throw err;
//     console.log(md5(buffer)); // Outputs the MD5 hash of file's content
// });
