// unique-slug.js

const crypto = require('crypto');

function uniqueSlug(str) {
    if (str) {
        // Create a SHA-256 hash from the input string
        const sha256Hash = crypto.createHash('sha256');
        sha256Hash.update(str);
        return sha256Hash.digest('hex').slice(0, 8);
    } else {
        // Generate 4 random bytes and convert them to an 8 character hex string
        return crypto.randomBytes(4).toString('hex');
    }
}

module.exports = uniqueSlug;

// Example Usage:
// const uniqueSlug = require('./unique-slug');
// console.log(uniqueSlug()); // Random 8 char slug
// console.log(uniqueSlug('/etc/passwd')); // Hash based 8 char slug
