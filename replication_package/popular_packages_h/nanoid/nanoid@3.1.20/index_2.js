// Import necessary modules
const crypto = require('crypto');
const { urlAlphabet } = require('./url-alphabet/index.cjs');

// Define a multiplier for the size of the random byte pool
const POOL_SIZE_MULTIPLIER = 32;

// Initialize variables for the random byte pool
let pool, poolOffset;

// Function to generate random bytes using a buffered pool
const random = (bytes) => {
  if (!pool || pool.length < bytes) {
    // Allocate a larger buffer to reduce frequent crypto calls
    pool = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER);
    crypto.randomFillSync(pool);
    poolOffset = 0;
  } else if (poolOffset + bytes > pool.length) {
    // Refill the pool when the current buffer is exhausted
    crypto.randomFillSync(pool);
    poolOffset = 0;
  }

  // Slice out the required number of random bytes from the pool
  const res = pool.subarray(poolOffset, poolOffset + bytes);
  poolOffset += bytes;
  return res;
}

// Function to create a random ID generator based on a custom alphabet
const customRandom = (alphabet, size, getRandom) => {
  // Calculate a bitmask for random bytes
  const mask = (2 << (31 - Math.clz32((alphabet.length - 1) | 1))) - 1;
  const step = Math.ceil((1.6 * mask * size) / alphabet.length);

  return () => {
    let id = '';
    while (true) {
      const bytes = getRandom(step);
      let i = step;
      while (i--) {
        // Use only valid bytes, discard others by appending an empty string
        id += alphabet[bytes[i] & mask] || '';
        if (id.length === size) return id;
      }
    }
  }
}

// Function to generate a custom alphabet-based random ID generator
const customAlphabet = (alphabet, size) => customRandom(alphabet, size, random);

// Function to generate a random ID using the predefined URL-friendly alphabet
const nanoid = (size = 21) => {
  const bytes = random(size);
  let id = '';
  while (size--) {
    // Map random bytes to characters in the URL alphabet
    id += urlAlphabet[bytes[size] & 63];
  }
  return id;
}

// Export functions for external usage
module.exports = { nanoid, customAlphabet, customRandom, urlAlphabet, random };
