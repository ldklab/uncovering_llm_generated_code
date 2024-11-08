// randombytes.js

const crypto = require('crypto');

function randomBytes(size, callback) {
  const isBrowserEnv = typeof window !== 'undefined' && (window.crypto || window.msCrypto);

  if (callback && typeof callback === 'function') {
    // Asynchronous operation with callback
    if (isBrowserEnv) {
      try {
        const randomArray = new Uint8Array(size);
        (window.crypto || window.msCrypto).getRandomValues(randomArray);
        callback(null, Buffer.from(randomArray)); // Execute callback with the buffer
      } catch (err) {
        callback(err, null); // Handle errors by passing them to the callback
      }
    } else {
      crypto.randomBytes(size, callback); // Use Node.js crypto for async operation
    }
  } else {
    // Synchronous operation
    if (isBrowserEnv) {
      const randomArray = new Uint8Array(size);
      (window.crypto || window.msCrypto).getRandomValues(randomArray);
      return Buffer.from(randomArray); // Return buffer with random values
    } else {
      return crypto.randomBytes(size); // Use Node.js crypto for synchronous operation
    }
  }
}

module.exports = randomBytes;
