// Functionality: Convert a pattern to a regular expression that matches strings based on glob-like syntax and test strings against it.
const patternToRegex = (pattern, options = {}) => {
  // Convert the pattern to a regex string by replacing glob patterns with regex equivalents
  const regexStr = pattern
    .replace(/\*\*/g, '.*')       // Translate globstar '**' to match any number of characters, including path separators
    .replace(/\*/g, '[^/]*')      // Translate single '*' to match any number of characters except path separators
    .replace(/\?/g, '.')          // Translate '?' to match a single character
    .replace(/\./g, '\\.')        // Escape '.' to match a literal dot
    .replace(/\//g, '\\/');       // Escape '/' to match a literal slash
  
  // Create a new regex object with casing options and start-end anchors
  return new RegExp(`^${regexStr}$`, options.nocase ? 'i' : '');
};

// Main function to match strings against a glob pattern
const picomatch = (pattern, options) => {
  const regex = patternToRegex(pattern, options);
  return (str) => regex.test(str); // Return a function that tests if the string matches the converted regex
};

// Example usage of picomatch function
const isMatch = picomatch('*.js');
console.log(isMatch('file.js'));  // true - 'file.js' matches the '*.js' pattern
console.log(isMatch('file.txt')); // false - 'file.txt' does not match the '*.js' pattern

// Static method to test if an input matches a given regex pattern
picomatch.test = (input, regex) => {
  const match = input.match(regex);
  return { isMatch: !!match, match, output: input }; // Return details of the match
};

// Module export
module.exports = picomatch;
```