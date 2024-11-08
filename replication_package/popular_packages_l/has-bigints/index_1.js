// index.js
function isBigIntSupported() {
  try {
    BigInt(0);  // Check if BigInt can be instantiated
    return true; // Return true if successful
  } catch (error) {
    return false; // Return false if an error is thrown
  }
}

module.exports = isBigIntSupported;

// test.js
const isBigIntSupported = require('./index');

console.log('BigInt support:', isBigIntSupported());
