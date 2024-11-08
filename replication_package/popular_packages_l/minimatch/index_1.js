// minimatch.js

const path = require('path');

// Helper to escape special regex characters
const escapeRegex = (str) => str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");

// Convert glob patterns to regex
const globToRegex = (pattern, options = {}) => {
  // Escape special regex characters in the pattern
  let re = escapeRegex(pattern);
  // Replace glob * with .*, and ? with ., adding optional treatment for dots
  re = re.replace(/\\\*/g, '.*').replace(/\\\?/g, '.');
  if (options.dot) re = re.replace(/\\\./g, '\\.');
  // Return a new RegExp to match the entire string (^ and $)
  return new RegExp(`^${re}$`);
}

// Test if a string matches a pattern
const minimatch = (str, pattern, options = {}) => {
  // Split the pattern by path separators, convert each part into a regex
  const usePattern = pattern.split(path.sep).reduce((acc, part) => {
    acc.push(globToRegex(part, options));
    return acc;
  }, []);
  // Ensure every regex in the pattern matches the string
  return usePattern.every(re => re.test(str));
};

// Create a filter function for arrays
minimatch.filter = (pattern, options) => (file) => minimatch(file, pattern, options);

// Escape all magic characters in a pattern string
minimatch.escape = (pattern) => escapeRegex(pattern);

// Class to handle matching operations with patterns
class Minimatch {
  constructor(pattern, options = {}) {
    // Store pattern and options
    this.pattern = pattern;
    this.options = options;
    // Precompute regex set from pattern
    this.set = pattern.split(path.sep).map(part => globToRegex(part, options));
  }

  // Create a regex from the pattern for matching
  makeRe() {
    return new RegExp(this.pattern.split(path.sep).map(part => globToRegex(part, this.options)).join(''));
  }

  // Check if filename matches the pattern
  match(fname) {
    return this.set.every(re => re.test(fname));
  }

  // Check if the pattern contains special glob characters
  hasMagic() {
    return /\*|\?/.test(this.pattern);
  }
}

// Exporting the functionality
module.exports = { minimatch, Minimatch };
