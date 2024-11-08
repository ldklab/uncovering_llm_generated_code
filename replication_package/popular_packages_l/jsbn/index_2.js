const { BigInteger } = require('jsbn');

// Create a BigInteger instance with a large number
const bigIntNumber = new BigInteger('91823918239182398123');

// Calculate and log the bit length of the big integer
const bitLengthOfBigInt = bigIntNumber.bitLength();
console.log(bitLengthOfBigInt); // Outputs the bit length
