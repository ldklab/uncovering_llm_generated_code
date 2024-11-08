// unique-slug.js

const crypto = require('crypto');

function uniqueSlug(input) {
    if (input) {
        const sha256Hash = crypto.createHash('sha256').update(input).digest('hex');
        return sha256Hash.slice(0, 8);
    } else {
        return crypto.randomBytes(4).toString('hex');
    }
}

module.exports = uniqueSlug;

// Example Usage:
// const uniqueSlug = require('./unique-slug');
// console.log(uniqueSlug()); // Random 8-character slug
// console.log(uniqueSlug('/etc/passwd')); // Hash-based 8-character slug
