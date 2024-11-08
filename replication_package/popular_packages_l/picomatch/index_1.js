// Convert a glob pattern to a regular expression
const patternToRegex = (pattern, options = {}) => {
  // Transform glob-like syntax to regular expression syntax
  const regexStr = pattern
    .replace(/\*\*/g, '.*')       // Convert double asterisk (**) to match zero or more directories
    .replace(/\*/g, '[^/]*')      // Convert single asterisk (*) to match any sequence of characters except slash
    .replace(/\?/g, '.')          // Convert question mark (?) to match any single character
    .replace(/\./g, '\\.')        // Escape dot to literal '.'
    .replace(/\//g, '\\/');       // Escape slash to literal '/'

  // Return a regular expression object, case-insensitive if the 'nocase' option is set
  return new RegExp(`^${regexStr}$`, options.nocase ? 'i' : '');
};

// Main function to create a matcher function based on a pattern
const picomatch = (pattern, options) => {
  const regex = patternToRegex(pattern, options);
  return (str) => regex.test(str); // Return a function that tests if the input string matches the pattern regex
};

// Demonstrate pattern matching usage
const isMatch = picomatch('*.js'); // Create a matching function for '*.js' pattern
console.log(isMatch('file.js'));  // Should print: true, as 'file.js' matches the pattern
console.log(isMatch('file.txt')); // Should print: false, as 'file.txt' does not match the pattern

// Additional 'test' method for exporting match details
picomatch.test = (input, regex) => {
  const match = input.match(regex); // Attempt to match the input with the provided regex
  return { isMatch: !!match, match, output: input }; // Return match result including input and matched portion
};

// Export the 'picomatch' function as a module
module.exports = picomatch;

// Note: More functionalities can be added as needed, maintaining the pattern-to-regex conversion logic.
```