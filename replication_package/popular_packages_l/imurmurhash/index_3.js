// Assume MurmurHash3 is a hashing library providing a chainable hash function
function MurmurHash3(initialString) {
    let state = initialString;

    return {
        hash: function (newString) {
            // Update the state with the new string; in a realistic scenario,
            // this would include actual hashing logic
            state = `${state}${newString}`;
            return this; // Return this for method chaining
        },
        result: function () {
            // Return the final hash; this is a placeholder
            return `Hash of: ${state}`;
        }
    };
}

// Create a new hash state
var hashState = MurmurHash3('initialString');

// Add more strings
hashState.hash('secondString').hash('thirdString');

// Get the hash result
var hashOutput = hashState.result();

console.log(hashOutput); // Output: Hash of: initialStringsecondStringthirdString
