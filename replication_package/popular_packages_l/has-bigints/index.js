## File: index.js
function hasBigInts() {
  try {
    // Attempts to create a BigInt to check for native support
    BigInt(0);
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = hasBigInts;

## File: test.js
var hasBigInts = require('./index');

console.log('BigInt support:', hasBigInts());