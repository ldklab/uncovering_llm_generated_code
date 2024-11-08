// minimatch.js

const path = require('path');

// Helper function to escape special regex characters in a string
const escapeRegex = (str) => str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");

// Function to convert a glob pattern into a regular expression
const globToRegex = (pattern, options = {}) => {
  let regexPattern = escapeRegex(pattern); // Escape regex special characters
  regexPattern = regexPattern.replace(/\\\*/g, '.*').replace(/\\\?/g, '.'); // Convert wildcard globs '*', '?' to regex equivalents '.*', '.'
  if (options.dot) regexPattern = regexPattern.replace(/\\\./g, '\\.'); // Handle dots if 'dot' option is specified
  return new RegExp(`^${regexPattern}$`); // Create a new RegExp object
}

// Function to test if a string matches a given pattern
const minimatch = (str, pattern, options = {}) => {
  // Break down pattern by path separators, convert to regex and test against the string
  const regexArray = pattern.split(path.sep).map(part => globToRegex(part, options));
  return regexArray.every(regex => regex.test(str));
};

// Function to create a filter function for arrays that matches items to a pattern
minimatch.filter = (pattern, options) => (file) => minimatch(file, pattern, options);

// Function to escape all special regex characters in a pattern string
minimatch.escape = (pattern) => escapeRegex(pattern);

// Class to represent and handle a Minimatch pattern
class Minimatch {
  constructor(pattern, options = {}) {
    this.pattern = pattern;
    this.options = options;
    this.set = pattern.split(path.sep).map(part => globToRegex(part, options));
  }

  // Generate the combined regular expression from the splits
  makeRe() {
    return new RegExp(this.pattern.split(path.sep).map(part => globToRegex(part, this.options)).join(''));
  }

  // Test if a filename matches the pattern
  match(fname) {
    return this.set.every(re => re.test(fname));
  }

  // Check if the pattern has any special wildcard characters
  hasMagic() {
    return /\*|\?/.test(this.pattern);
  }
}

// Export the minimatch functions and Minimatch class
module.exports = { minimatch, Minimatch };
