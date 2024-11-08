// index.js
function isBigIntSupported() {
  try {
    // This will run if BigInt is supported
    BigInt(0);
    return true;
  } catch (error) {
    // This will execute if there is no BigInt support
    return false;
  }
}

module.exports = isBigIntSupported;

// test.js
const isBigIntSupported = require('./index');

console.log('Is BigInt supported:', isBigIntSupported());
