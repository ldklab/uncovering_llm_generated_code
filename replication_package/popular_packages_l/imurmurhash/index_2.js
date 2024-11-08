// Initialize the MurmurHash3 hashing with an initial string
var hashState = MurmurHash3('initialString');

// Hash additional strings sequentially
hashState = hashState.hash('secondString');
hashState = hashState.hash('thirdString');

// Retrieve the final hash value
var hashOutput = hashState.result();
