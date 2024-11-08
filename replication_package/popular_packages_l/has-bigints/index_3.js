// index.js
function checkBigIntSupport() {
  try {
    BigInt(0);
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = checkBigIntSupport;

// test.js
const checkBigIntSupport = require('./index');

console.log('BigInt support:', checkBigIntSupport());
