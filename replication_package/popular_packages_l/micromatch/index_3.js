const path = require('path');

// Function to match a list of file paths with patterns
function micromatch(list, patterns, options = {}) {
  const patternList = Array.isArray(patterns) ? patterns : [patterns];
  const ignorePatterns = options.ignore ? toArray(options.ignore) : [];

  return list.filter(item => matches(item, patternList, options) && !matches(item, ignorePatterns, options));
}

// Function to check if a string matches given patterns
function isMatch(str, patterns, options = {}) {
  return matches(str, toArray(patterns), options);
}

// Function to create a matcher based on a pattern
function matcher(pattern, options = {}) {
  const regex = makeRe(pattern, options);
  return str => regex.test(str);
}

// Function to determine if input matches any pattern
function matches(input, patterns, options = {}) {
  return patterns.some(pattern => makeRe(pattern, options).test(input));
}

// Function to create RegExp from a pattern
function makeRe(pattern, options = {}) {
  const escapedPattern = pattern.replace(/([.*+?^${}()|[\]\\])/g, '\\$1');
  const regexString = escapedPattern.replace(/\*/g, '[^/]*').replace(/\?/g, '.');
  const regexFlags = options.nocase ? 'i' : '';
  return new RegExp(`^${regexString}$`, regexFlags);
}

// Convert non-array input to an array
function toArray(input) {
  return Array.isArray(input) ? input : [input];
}

module.exports = {
  micromatch,
  isMatch,
  matcher,
  makeRe
};

// Example usage
// const mm = require('./micromatch');
// const matches = mm.micromatch(['foo.js', 'bar.txt'], '*.js');
// console.log(matches); // Output: ['foo.js']
