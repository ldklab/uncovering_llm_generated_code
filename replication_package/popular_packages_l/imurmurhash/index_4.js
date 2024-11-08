// Initialize a new hash state with the initial string
let hashState = MurmurHash3('initialString');

// Incorporate additional strings into the hash calculation
hashState.hash('secondString');
hashState.hash('thirdString');

// Retrieve the computed hash value as the final output
let hashOutput = hashState.result();
