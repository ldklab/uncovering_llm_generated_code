// Convert glob patterns to regex patterns
const globToRegex = (pattern, options = {}) => {
  const processedPattern = pattern
    .replace(/\*\*/g, '.*')       // Convert globstar to match any path
    .replace(/\*/g, '[^/]*')      // Convert wildcard to match any segment except slash
    .replace(/\?/g, '.')          // Convert single character wildcard to match any single character
    .replace(/\./g, '\\.')        // Escape dot to match literal dot
    .replace(/\//g, '\\/');       // Escape slash to match literal slash

  // Construct the regex with case insensitivity if 'nocase' option is true
  const regexFlags = options.nocase ? 'i' : '';
  return new RegExp(`^${processedPattern}$`, regexFlags);
};

// Main function to match strings against a pattern
const picomatch = (pattern, options) => {
  const regex = globToRegex(pattern, options);
  return (str) => regex.test(str); // Return a function that tests if the string matches the regex
};

// Example usage: matching files with specific pattern
const isMatch = picomatch('*.js');
console.log(isMatch('file.js'));  // Output: true - Matches .js files
console.log(isMatch('file.txt')); // Output: false - Does not match .txt files

// Additional test utility function for direct regex testing
picomatch.test = (input, regex) => {
  const match = input.match(regex);
  return { isMatch: !!match, match, output: input }; // Return object with match details
};

// Export the picomatch function
module.exports = picomatch;

// Note: This is a basic implementation example. Full-featured glob matching might involve more complex pattern processing.
```