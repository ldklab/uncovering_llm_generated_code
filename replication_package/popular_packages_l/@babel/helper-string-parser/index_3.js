// index.js

/**
 * Splits a string by a specified delimiter
 * @param {string} str - The string to be split
 * @param {string} delimiter - The delimiter to use for splitting the string
 * @returns {string[]} - The array of split strings
 */
function splitString(str, delimiter) {
  if (!isString(str) || !isString(delimiter)) {
    throw new TypeError('Arguments must be of type string');
  }
  return str.split(delimiter);
}

/**
 * Finds a substring within a string
 * @param {string} str - The string to search
 * @param {string} query - The substring to find
 * @returns {number} - The index of the first occurrence of the substring, or -1 if not found
 */
function findSubstring(str, query) {
  if (!isString(str) || !isString(query)) {
    throw new TypeError('Arguments must be of type string');
  }
  return str.indexOf(query);
}

/**
 * Matches a pattern in a string using a regular expression
 * @param {string} str - The string to search
 * @param {RegExp} pattern - The regular expression pattern to match
 * @returns {Array|null} - The matched results, or null if no match is found
 */
function matchPattern(str, pattern) {
  if (!isString(str) || !(pattern instanceof RegExp)) {
    throw new TypeError('First argument must be a string and second must be a RegExp');
  }
  return str.match(pattern);
}

/**
 * Helper function to check if a value is a string
 * @param {*} value - The value to check
 * @returns {boolean} - Whether the value is a string
 */
function isString(value) {
  return typeof value === 'string';
}

module.exports = {
  splitString,
  findSubstring,
  matchPattern,
};
