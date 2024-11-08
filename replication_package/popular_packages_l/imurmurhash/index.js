// Create a new hash state
var hashState = MurmurHash3('initialString');

// Add more strings
hashState.hash('secondString').hash('thirdString');

// Get the hash result
var hashOutput = hashState.result();
