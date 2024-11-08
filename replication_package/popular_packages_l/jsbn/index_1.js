const { BigInteger } = require('jsbn');

const bigNumber = new BigInteger('91823918239182398123');
const bitLength = bigNumber.bitLength();

console.log(bitLength); // Logs the bit length of the big integer
