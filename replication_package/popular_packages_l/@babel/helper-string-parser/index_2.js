// index.js

/**
 * Splits a string by a specified delimiter
 * @param {string} str - The string to be split
 * @param {string} delimiter - The delimiter to use for splitting the string
 * @returns {string[]} - The array of split strings
 */
const splitString = (str, delimiter) => {
  if (typeof str !== 'string' || typeof delimiter !== 'string') {
    throw new TypeError('Arguments must be of type string');
  }
  return str.split(delimiter);
};

/**
 * Finds a substring within a string
 * @param {string} str - The string to search
 * @param {string} query - The substring to find
 * @returns {number} - The index of the first occurrence of the substring, or -1 if not found
 */
const findSubstring = (str, query) => {
  if (typeof str !== 'string' || typeof query !== 'string') {
    throw new TypeError('Arguments must be of type string');
  }
  return str.indexOf(query);
};

/**
 * Matches a pattern in a string using a regular expression
 * @param {string} str - The string to search
 * @param {RegExp} pattern - The regular expression pattern to match
 * @returns {Array|null} - The matched results, or null if no match is found
 */
const matchPattern = (str, pattern) => {
  if (typeof str !== 'string' || !(pattern instanceof RegExp)) {
    throw new TypeError('First argument must be a string and second must be a RegExp');
  }
  return str.match(pattern);
};

module.exports = {
  splitString,
  findSubstring,
  matchPattern,
};
