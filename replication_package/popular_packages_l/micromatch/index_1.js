// micromatch.js

const path = require('path');

/**
 * Matches a list of strings against given patterns.
 * @param {Array<string>} list - The list of file paths.
 * @param {Array|string} patterns - The patterns to match against.
 * @param {Object} [options={}] - Options to alter the matching.
 * @returns {Array<string>} The list of matching items.
 */
function micromatch(list, patterns, options = {}) {
  const patternList = toArray(patterns);
  const ignorePatterns = options.ignore ? toArray(options.ignore) : [];

  return list.filter(item => {
    return matches(item, patternList, options) && !matches(item, ignorePatterns, options);
  });
}

/**
 * Checks if a string matches given glob patterns.
 * @param {string} str - The string to check.
 * @param {string|Array<string>} patterns - The patterns to match against.
 * @param {Object} [options={}] - Options for altering the match process.
 * @returns {boolean} True if the string matches any pattern.
 */
function isMatch(str, patterns, options = {}) {
  return matches(str, toArray(patterns), options);
}

/**
 * Creates a matcher function based on the given pattern and options.
 * @param {string} pattern - The single pattern to match.
 * @param {Object} [options={}] - Options to alter the matching.
 * @returns {Function} Matcher function that accepts a string and returns a boolean indicating a match.
 */
function matcher(pattern, options = {}) {
  const regex = makeRe(pattern, options);
  return str => regex.test(str);
}

/**
 * Checks if an input matches any pattern from a list.
 * @param {string} input - The input to check.
 * @param {Array<string>} patterns - The pattern(s) to match against.
 * @param {Object} [options={}] - Customization options.
 * @returns {boolean} Indicates a match.
 */
function matches(input, patterns, options = {}) {
  return patterns.some(pattern => makeRe(pattern, options).test(input));
}

/**
 * Creates a regular expression from a glob pattern.
 * @param {string} pattern - The pattern to convert to regex.
 * @param {Object} [options={}] - Options can customize the behavior.
 * @returns {RegExp} A regular expression for the given glob pattern.
 */
function makeRe(pattern, options = {}) {
  const escapedPattern = pattern.replace(/([.*+?^${}()|[\]\\])/g, '\\$1');
  const regexString = escapedPattern.replace(/\*/g, '[^/]*').replace(/\?/g, '.');
  const regexFlags = options.nocase ? 'i' : '';
  return new RegExp(`^${regexString}$`, regexFlags);
}

/**
 * Converts a non-array input to an array.
 * @param {Array|string} input - The input which may be a string or array.
 * @returns {Array} The input presented as an array.
 */
function toArray(input) {
  return Array.isArray(input) ? input : [input];
}

// Export functions
module.exports = {
  micromatch,
  isMatch,
  matcher,
  makeRe
};
