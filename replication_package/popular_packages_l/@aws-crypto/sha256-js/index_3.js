// crypto-sha256-js/index.js
import { createHmac, createHash } from 'crypto';

class Sha256 {
  constructor(key = null) {
    // If a key is provided, initialize HMAC with the key, otherwise initialize a simple SHA-256 hash
    this.key = key;
    this.hash = key ? createHmac('sha256', key) : createHash('sha256');
  }
  
  update(data) {
    // Update the hash instance with data
    this.hash.update(data);
  }
  
  async digest() {
    // Finalize the hash and return as a hex string
    return this.hash.digest('hex');
  }
}

export { Sha256 };

// crypto-sha256-js/test/index.test.js
import { Sha256 } from '../index.js';

test('Hashing functionality', async () => {
  const hash = new Sha256(); // Create a Sha256 instance for hashing
  hash.update('some data'); // Update the hash with data
  const result = await hash.digest(); // Get the final hash as a hex string
  expect(result).toBe('b94d27b9934d3e08a52e52d7da7dabfade1ccf640d4e9a3b77d064143d964779'); // Verify with known SHA-256
});

test('HMAC functionality', async () => {
  const hash = new Sha256('a key'); // Create a Sha256 instance for HMAC with a key
  hash.update('some data'); // Update the hash with data
  const result = await hash.digest(); // Get the final HMAC as a hex string
  expect(result).toBe('f7bc83f430538424b13298e6aa6fb143efd016b680f3914852212f3d7d8f3731'); // Verify with known HMAC-SHA-256
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
