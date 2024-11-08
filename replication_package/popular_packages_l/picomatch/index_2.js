// This code provides a basic implementation of glob pattern matching using regular expressions.
// It translates glob patterns into regex patterns and tests strings against them.

const convertPatternToRegex = (pattern, options = {}) => {
  // Convert glob pattern to a regex pattern
  const regexPattern = pattern
    .replace(/\*\*/g, '.*')       // Convert double star to match any path
    .replace(/\*/g, '[^/]*')      // Convert single star to match any sequence of non-slash characters
    .replace(/\?/g, '.')          // Convert question mark to match any single character
    .replace(/\./g, '\\.')        // Escape dot to match a literal dot
    .replace(/\//g, '\\/');       // Escape slash to match a literal slash

  // Return the constructed regular expression with the appropriate flags
  return new RegExp(`^${regexPattern}$`, options.nocase ? 'i' : '');
};

const picomatch = (pattern, options) => {
  // Get the regex equivalent of the pattern
  const regex = convertPatternToRegex(pattern, options);

  // Return a function that tests input strings against the regex
  return (inputString) => regex.test(inputString);
};

// Example usage
const isMatchFunction = picomatch('*.js');
console.log(isMatchFunction('file.js'));  // Expected output: true
console.log(isMatchFunction('file.txt')); // Expected output: false

// Add a `test` method to the picomatch function for external regex matching
picomatch.test = (inputString, regex) => {
  const matchResult = inputString.match(regex);
  return { isMatch: !!matchResult, match: matchResult, output: inputString };
};

// Export the picomatch function for use in other modules
module.exports = picomatch;

// Note: This code can be extended by adding more comprehensive glob to regex conversion and tests
```