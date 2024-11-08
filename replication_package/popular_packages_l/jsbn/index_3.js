// Import the BigInteger class from the jsbn library
const { BigInteger } = require('jsbn');

// Create a BigInteger instance with a specified large integer
const bigIntValue = new BigInteger('91823918239182398123');

// Get the bit length of the big integer and log it to the console
const bitLength = bigIntValue.bitLength();
console.log(bitLength); // Outputs the bit length of the big integer
