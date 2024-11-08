// Import the murmurhash3 module (hypothetical example)
const MurmurHash3 = require('murmurhash3js');

// Create a new hash instance with an initial state
let hashState = MurmurHash3.x86.hash32("initialString");

// Update the hash with additional strings
hashState = MurmurHash3.x86.hash32("secondString", hashState);
hashState = MurmurHash3.x86.hash32("thirdString", hashState);

// Get the final hash result
let hashOutput = hashState;

// Output the hash result
console.log(hashOutput);
