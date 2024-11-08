json
// package.json
{
  "name": "@smithy/util-base64",
  "version": "1.0.0",
  "description": "Utility functions for Base64 encoding and decoding",
  "main": "index.js",
  "scripts": {
    "test": "node test.js"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/yourusername/util-base64.git"
  },
  "keywords": ["base64", "encoding", "decoding", "utility"],
  "author": "Your Name",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/yourusername/util-base64/issues"
  },
  "homepage": "https://github.com/yourusername/util-base64#readme"
}

// index.js
class UtilBase64 {
  static encode(input) {
    if (Buffer.isBuffer(input)) {
      return input.toString('base64');
    }
    throw new Error('Input must be a Buffer');
  }

  static decode(base64String) {
    if (typeof base64String === 'string') {
      return Buffer.from(base64String, 'base64');
    }
    throw new Error('Input must be a Base64 encoded string');
  }
}

module.exports = UtilBase64;

// test.js
const UtilBase64 = require('./index');
const assert = require('assert');

try {
  const originalBuffer = Buffer.from('Hello, world!');
  const encoded = UtilBase64.encode(originalBuffer);
  console.log('Encoded:', encoded);
  assert.strictEqual(encoded, originalBuffer.toString('base64'));
} catch (error) {
  console.error('Encoding failed:', error);
}

try {
  const base64String = 'SGVsbG8sIHdvcmxkIQ==';
  const decoded = UtilBase64.decode(base64String);
  console.log('Decoded:', decoded.toString());
  assert.strictEqual(decoded.toString(), 'Hello, world!');
} catch (error) {
  console.error('Decoding failed:', error);
}
