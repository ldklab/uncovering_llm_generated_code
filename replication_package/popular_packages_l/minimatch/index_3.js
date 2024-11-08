// minimatch.js

const path = require('path');

// Helper to escape special regex characters
const escapeRegex = (str) => str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");

// Convert glob patterns to regex
const globToRegex = (pattern, options = {}) => {
  let re = escapeRegex(pattern);
  re = re.replace(/\\\*/g, '.*').replace(/\\\?/g, '.');
  if (options.dot) re = re.replace(/\\\./g, '\\.');
  return new RegExp(`^${re}$`);
}

// Test if a string matches a pattern
const minimatch = (str, pattern, options = {}) => {
  const regexParts = pattern.split(path.sep).map(part => globToRegex(part, options));
  return regexParts.every(re => re.test(str));
};

// Create a filter function for arrays
minimatch.filter = (pattern, options) => (file) => minimatch(file, pattern, options);

// Escape all magic characters
minimatch.escape = (pattern) => escapeRegex(pattern);

// Class to represent a Minimatch pattern
class Minimatch {
  constructor(pattern, options = {}) {
    this.pattern = pattern;
    this.options = options;
    this.regexSet = pattern.split(path.sep).map(part => globToRegex(part, options));
  }

  makeRe() {
    const regexString = this.pattern.split(path.sep).map(part => globToRegex(part, this.options)).join('');
    return new RegExp(regexString);
  }

  match(filename) {
    return this.regexSet.every(re => re.test(filename));
  }

  hasMagic() {
    return /[*?]/.test(this.pattern);
  }
}

// Exporting the functionality
module.exports = { minimatch, Minimatch };
