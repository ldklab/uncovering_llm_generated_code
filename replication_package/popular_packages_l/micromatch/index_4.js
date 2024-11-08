// micromatch.js

const path = require('path');

/**
 * Filters a list of strings against given patterns.
 * @param {Array<string>} list List of strings to be matched.
 * @param {Array|string} patterns Patterns to be matched against.
 * @param {Object} [options={}] Options to customize the matching behavior.
 * @returns {Array<string>} List of strings that match the patterns.
 */
function micromatch(list, patterns, options = {}) {
  const patternList = Array.isArray(patterns) ? patterns : [patterns];
  const ignorePatterns = options.ignore ? convertToArray(options.ignore) : [];

  return list.filter(item => isMatching(item, patternList, options) && !isMatching(item, ignorePatterns, options));
}

/**
 * Determines if a string matches specified patterns.
 * @param {string} str The string to evaluate.
 * @param {string|Array<string>} patterns Patterns to check against.
 * @param {Object} [options={}] Options to tweak matching logic.
 * @returns {boolean} True if any pattern matches the string, false otherwise.
 */
function isMatch(str, patterns, options = {}) {
  return isMatching(str, convertToArray(patterns), options);
}

/**
 * Provides a function to match strings against a specific pattern.
 * @param {string} pattern Single pattern for matching.
 * @param {Object} [options={}] Options to adjust matching.
 * @returns {Function} A function that tests strings against the pattern, returning true or false for matches.
 */
function matcher(pattern, options = {}) {
  const regex = createRegex(pattern, options);
  return (str) => regex.test(str);
}

/**
 * Evaluates if a given string matches any of the supplied patterns.
 * 
 * @param {string} input String to check.
 * @param {Array<string>} patterns Patterns to test against.
 * @param {Object} [options={}] Options to refine match logic.
 * @returns {boolean} True if there's a match, false otherwise.
 */
function isMatching(input, patterns, options = {}) {
  return patterns.some(pattern => createRegex(pattern, options).test(input));
}

/**
 * Converts a glob pattern to a regular expression.
 * 
 * @param {string} pattern The glob pattern to be transformed.
 * @param {Object} [options={}] Options that influence regex creation.
 * @returns {RegExp} Regular expression derived from the glob pattern.
 */
function createRegex(pattern, options = {}) {
  let escapedPattern = pattern.replace(/([.*+?^${}()|[\]\\])/g, '\\$1');
  escapedPattern = escapedPattern.replace(/\*/g, '[^/]*').replace(/\?/g, '.');
  const flags = options.nocase ? 'i' : '';
  return new RegExp(`^${escapedPattern}$`, flags);
}

/**
 * Ensures that the input is returned as an array.
 *
 * @param {Array|string} input Input which can be a string or an array.
 * @returns {Array} The input converted into an array.
 */
function convertToArray(input) {
  return Array.isArray(input) ? input : [input];
}

// Export the functions
module.exports = {
  micromatch,
  isMatch,
  matcher,
  createRegex
};

// Usage example
// const mm = require('./micromatch');
// const matches = mm.micromatch(['foo.js', 'bar.txt'], '*.js');
// console.log(matches);  // Output: ['foo.js']
