// File: index.js
function isBigIntSupported() {
  try {
    BigInt(0);
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = isBigIntSupported;

// File: test.js
const isBigIntSupported = require('./index');

console.log('BigInt support:', isBigIntSupported());
