markdown
// randombytes.js

const crypto = require('crypto');

function randomBytes(size, callback) {
  if (callback && typeof callback === 'function') {
    // Asynchronous operation with callback
    if (typeof window !== 'undefined' && (window.crypto || window.msCrypto)) {
      try {
        const randomArray = new Uint8Array(size);
        (window.crypto || window.msCrypto).getRandomValues(randomArray);
        callback(null, Buffer.from(randomArray));
      } catch (err) {
        callback(err, null);
      }
    } else {
      crypto.randomBytes(size, callback);
    }
  } else {
    // Synchronous operation
    if (typeof window !== 'undefined' && (window.crypto || window.msCrypto)) {
      const randomArray = new Uint8Array(size);
      (window.crypto || window.msCrypto).getRandomValues(randomArray);
      return Buffer.from(randomArray);
    } else {
      return crypto.randomBytes(size);
    }
  }
}

module.exports = randomBytes;
