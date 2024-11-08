// randombytes.js

const crypto = require('crypto');

function randomBytes(size, callback) {
  const isBrowser = typeof window !== 'undefined' && (window.crypto || window.msCrypto);

  if (callback && typeof callback === 'function') {
    // Asynchronous operation with callback
    if (isBrowser) {
      try {
        const randomArray = new Uint8Array(size);
        window.crypto.getRandomValues(randomArray);
        callback(null, Buffer.from(randomArray));
      } catch (err) {
        callback(err, null);
      }
    } else {
      crypto.randomBytes(size, callback);
    }
  } else {
    // Synchronous operation
    if (isBrowser) {
      const randomArray = new Uint8Array(size);
      window.crypto.getRandomValues(randomArray);
      return Buffer.from(randomArray);
    } else {
      return crypto.randomBytes(size);
    }
  }
}

module.exports = randomBytes;
