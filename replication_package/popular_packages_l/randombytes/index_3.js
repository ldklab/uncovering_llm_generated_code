// randombytes.js

const crypto = require('crypto');

function randomBytes(size, callback) {
  const isBrowser = typeof window !== 'undefined' && (window.crypto || window.msCrypto);
  const getRandomValues = isBrowser ? (window.crypto || window.msCrypto).getRandomValues.bind(window.crypto || window.msCrypto) : null;

  if (callback && typeof callback === 'function') {
    // Perform asynchronous operation if callback is provided
    if (isBrowser) {
      try {
        const randomArray = new Uint8Array(size);
        getRandomValues(randomArray);
        callback(null, Buffer.from(randomArray));
      } catch (err) {
        callback(err, null);
      }
    } else {
      // Use Node.js crypto module for asynchronous operation
      crypto.randomBytes(size, callback);
    }
  } else {
    // Perform synchronous operation if no callback is provided
    if (isBrowser) {
      const randomArray = new Uint8Array(size);
      getRandomValues(randomArray);
      return Buffer.from(randomArray);
    } else {
      return crypto.randomBytes(size);
    }
  }
}

module.exports = randomBytes;
