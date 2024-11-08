// uniqueSlug.js

const crypto = require('crypto');

function uniqueSlug(str) {
    if (str) {
        const hash = crypto.createHash('sha256').update(str).digest('hex');
        return hash.slice(0, 8);
    } else {
        return crypto.randomBytes(4).toString('hex');
    }
}

module.exports = uniqueSlug;

// Example Usage:
// const uniqueSlug = require('./uniqueSlug');
// console.log(uniqueSlug());               // Random 8 character slug
// console.log(uniqueSlug('/etc/passwd'));  // Hash-based 8 character slug
