// is-glob.js

// Function to determine if the input string is a glob pattern
function isGlob(str, options = {}) {
  // Early return if input is not a string
  if (typeof str !== 'string') {
    return false;
  }

  const strict = options.strict !== false; // Default to strict mode if not specified

  // Define regex patterns based on the strictness
  const globRegex = strict
    ? /(^.*([*?{}()[\]!+]|(!)+(?=\())+.*$)/
    : /([*?{}()[\]!+])/; // Pattern to test general glob characters
  const extglobRegex = strict
    ? /(\\\!|\\\*|\\\)|\\\]|\\\(|\\\{|\\@|\\\+|\\\?|\(+(?=\())/
    : /(\\\!|\\\*|\\\|\\\)|\\\]|\\\(|\\\{|\\@|\\\+)/; // Pattern to exclude extended glob sequences

  // Return true if matches glob pattern but not an extended glob pattern
  return globRegex.test(str) && !extglobRegex.test(str);
}

// Export function for use in other modules
module.exports = isGlob;

// Example usage in comments:
// const isGlob = require('./is-glob');

// console.log(isGlob('!foo.js')); // true
// console.log(isGlob('abc/\\*.js')); // false
// console.log(isGlob('abc.js')); // false
// console.log(isGlob(['**/*.js'])); // false
// console.log(isGlob('*.js', { strict: false })); // true
