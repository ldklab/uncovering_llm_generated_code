// Simplified version of Picomatch
const patternToRegex = (pattern, options = {}) => {
  const regexStr = pattern
    .replace(/\*\*/g, '.*')       // Globstar
    .replace(/\*/g, '[^/]*')      // Wildcard
    .replace(/\?/g, '.')          // Single character
    .replace(/\./g, '\\.')        // Escape dot
    .replace(/\//g, '\\/');       // Escape slash

  return new RegExp(`^${regexStr}$`, options.nocase ? 'i' : '');
};

const picomatch = (pattern, options) => {
  const regex = patternToRegex(pattern, options);
  return (str) => regex.test(str);
};

// Example usage
const isMatch = picomatch('*.js');
console.log(isMatch('file.js'));  // true
console.log(isMatch('file.txt')); // false

// Test function as described in the API
picomatch.test = (input, regex) => {
  const match = input.match(regex);
  return { isMatch: !!match, match, output: input };
};

// Additional functions are omitted for brevity but would follow similar simplifications.
module.exports = picomatch;

// Examples of regex generation and matching can be expanded upon by implementing the rest of the API.
```