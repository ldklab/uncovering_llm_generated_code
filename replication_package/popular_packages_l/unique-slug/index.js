// unique-slug.js

const crypto = require('crypto');

function uniqueSlug(str) {
    if (str) {
        // Create a murmur hash from the input string
        const murmurHash = crypto.createHash('sha256');
        murmurHash.update(str);
        return murmurHash.digest('hex').slice(0, 8);
    } else {
        // Generate 4 random bytes and convert them to a hex string
        return crypto.randomBytes(4).toString('hex');
    }
}

module.exports = uniqueSlug;

// Example Usage:
// const uniqueSlug = require('./unique-slug');
// console.log(uniqueSlug()); // Random 8 char slug
// console.log(uniqueSlug('/etc/passwd')); // Hash based 8 char slug
