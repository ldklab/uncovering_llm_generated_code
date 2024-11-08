markdown
# package.json

{
  "name": "@smithy/md5-node",
  "version": "1.0.0",
  "description": "MD5 hash generation for Node.js",
  "main": "index.js",
  "scripts": {
    "test": "node test.js"
  },
  "keywords": [
    "md5",
    "hash",
    "node"
  ],
  "license": "ISC",
  "dependencies": {
    "crypto": "^1.0.1"
  }
}

# index.js

const crypto = require('crypto');

/**
 * Generate an MD5 hash for a given input.
 * @param {string|Buffer} input - The input data to hash.
 * @returns {string} The resulting MD5 hash as a hexadecimal string.
 */
function md5Hash(input) {
  return crypto.createHash('md5').update(input).digest('hex');
}

module.exports = {
  md5Hash
};

# test.js

const { md5Hash } = require('./index');

// Example usage:
const inputString = "Hello, World!";
const hash = md5Hash(inputString);
console.log(`MD5 Hash of '${inputString}': ${hash}`);

// Test with a buffer
const inputBuffer = Buffer.from("Hello, Buffer!");
const bufferHash = md5Hash(inputBuffer);
console.log(`MD5 Hash of buffer: ${bufferHash}`);

// Additional tests can be implemented as needed
