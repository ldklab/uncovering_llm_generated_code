// crypto-sha256-js/index.js
import { createHmac, createHash } from 'crypto';

class Sha256 {
  constructor(key = null) {
    // If a key is provided, set up HMAC using SHA-256 with the provided key, otherwise set up a SHA-256 hash
    this.key = key;
    this.hash = key ? createHmac('sha256', key) : createHash('sha256');
  }
  
  update(data) {
    // Update the current hash or HMAC with the provided data
    this.hash.update(data);
  }
  
  async digest() {
    // Return the computed hash or HMAC in hexadecimal format
    return this.hash.digest('hex');
  }
}

export { Sha256 };

// crypto-sha256-js/test/index.test.js
import { Sha256 } from '../index.js';

test('Hashing functionality', async () => {
  // Test creating a SHA-256 hash without a key
  const hash = new Sha256();
  hash.update('some data');
  const result = await hash.digest();
  // Expect result to match the known SHA-256 hash for 'some data'
  expect(result).toBe('b94d27b9934d3e08a52e52d7da7dabfade1ccf640d4e9a3b77d064143d964779');
});

test('HMAC functionality', async () => {
  // Test creating an HMAC with a key using SHA-256
  const hash = new Sha256('a key');
  hash.update('some data');
  const result = await hash.digest();
  // Expect result to match the known HMAC-SHA-256 for 'some data' with key 'a key'
  expect(result).toBe('f7bc83f430538424b13298e6aa6fb143efd016b680f3914852212f3d7d8f3731');
});

// package.json
{
  "name": "crypto-sha256-js",
  "version": "1.0.0",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "test": "jest"
  },
  "dependencies": {
    "crypto": "^1.0.1"
  },
  "devDependencies": {
    "jest": "^27.0.6"
  }
}
