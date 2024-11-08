const { BigInteger } = require('jsbn');

const bigInt = new BigInteger('91823918239182398123');

const bitLength = bigInt.bitLength();

console.log(`The bit length of the big integer is: ${bitLength}`);
