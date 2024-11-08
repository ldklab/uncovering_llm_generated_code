const crypto = require('crypto');
const { urlAlphabet } = require('./url-alphabet/index.cjs');

const POOL_SIZE_MULTIPLIER = 32;
let pool, poolOffset;

const random = bytes => {
  if (!pool || pool.length < bytes) {
    pool = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER);
    crypto.randomFillSync(pool);
    poolOffset = 0;
  } else if (poolOffset + bytes > pool.length) {
    crypto.randomFillSync(pool);
    poolOffset = 0;
  }

  const res = pool.subarray(poolOffset, poolOffset + bytes);
  poolOffset += bytes;
  return res;
}

const customRandom = (alphabet, size, getRandom) => {
  const mask = (2 << (31 - Math.clz32((alphabet.length - 1) | 1))) - 1;
  const step = Math.ceil((1.6 * mask * size) / alphabet.length);

  return () => {
    let id = '';
    while (true) {
      const bytes = getRandom(step);
      let i = step;
      while (i--) {
        id += alphabet[bytes[i] & mask] || '';
        if (id.length === size) return id;
      }
    }
  }
}

const customAlphabet = (alphabet, size) => customRandom(alphabet, size, random);

const nanoid = (size = 21) => {
  const bytes = random(size);
  let id = '';
  while (size--) {
    id += urlAlphabet[bytes[size] & 63];
  }
  return id;
}

module.exports = { nanoid, customAlphabet, customRandom, urlAlphabet, random };
