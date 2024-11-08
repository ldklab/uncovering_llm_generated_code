// randombytes.js

const crypto = require('crypto');

function randomBytes(size, callback) {
  const useBrowserCrypto = typeof window !== 'undefined' && (window.crypto || window.msCrypto);

  function getRandomValues(size) {
    const randomArray = new Uint8Array(size);
    (window.crypto || window.msCrypto).getRandomValues(randomArray);
    return Buffer.from(randomArray);
  }

  function nodeRandomBytes(size, callback) {
    if (callback) {
      crypto.randomBytes(size, callback);
    } else {
      return crypto.randomBytes(size);
    }
  }

  if (callback && typeof callback === 'function') {
    // Asynchronous operation
    if (useBrowserCrypto) {
      try {
        const randomData = getRandomValues(size);
        callback(null, randomData);
      } catch (err) {
        callback(err, null);
      }
    } else {
      nodeRandomBytes(size, callback);
    }
  } else {
    // Synchronous operation
    if (useBrowserCrypto) {
      return getRandomValues(size);
    } else {
      return nodeRandomBytes(size);
    }
  }
}

module.exports = randomBytes;
