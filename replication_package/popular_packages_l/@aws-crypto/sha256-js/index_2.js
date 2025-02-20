// crypto-sha256-js/index.js
import { createHmac, createHash } from 'crypto';

class Sha256 {
  constructor(key = null) {
    this.key = key;
    this.hash = key ? createHmac('sha256', key) : createHash('sha256');
  }
  
  update(data) {
    this.hash.update(data);
  }
  
  async digest() {
    return this.hash.digest('hex');
  }
}

export { Sha256 };

// crypto-sha256-js/test/index.test.js
import { Sha256 } from '../index.js';

test('Hashing functionality', async () => {
  const hash = new Sha256();
  hash.update('some data');
  const result = await hash.digest();
  expect(result).toBe('b94d27b9934d3e08a52e52d7da7dabfade1ccf640d4e9a3b77d064143d964779'); // expected SHA-256 hash
});

test('HMAC functionality', async () => {
  const hash = new Sha256('a key');
  hash.update('some data');
  const result = await hash.digest();
  expect(result).toBe('f7bc83f430538424b13298e6aa6fb143efd016b680f3914852212f3d7d8f3731'); // expected HMAC-SHA-256 hash
});

// package.json
{
  "name": "crypto-sha256-js",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "test": "jest"
  },
  "devDependencies": {
    "jest": "^27.0.6"
  }
}
