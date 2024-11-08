// index.js

/**
 * Splits the given string by the provided delimiter
 * @param {string} str - The input string to be divided
 * @param {string} delimiter - The string delimiter to split by
 * @returns {string[]} - An array containing the resulting substrings
 */
function splitString(str, delimiter) {
  if (typeof str !== 'string' || typeof delimiter !== 'string') {
    throw new TypeError('Both arguments need to be strings');
  }
  return str.split(delimiter);
}

/**
 * Locates the occurrence of a substring within a string
 * @param {string} str - The base string to search within
 * @param {string} query - The substring to locate
 * @returns {number} - The starting index of the found substring, or -1 if not found
 */
function findSubstring(str, query) {
  if (typeof str !== 'string' || typeof query !== 'string') {
    throw new TypeError('Both arguments must be strings');
  }
  return str.indexOf(query);
}

/**
 * Searches for matches of a regular expression pattern in a string
 * @param {string} str - String where the search is performed
 * @param {RegExp} pattern - The regular expression pattern to check against
 * @returns {Array|null} - The results of the match operation, or null if no matches are found
 */
function matchPattern(str, pattern) {
  if (typeof str !== 'string' || !(pattern instanceof RegExp)) {
    throw new TypeError('First argument should be a string and second argument should be a RegExp');
  }
  return str.match(pattern);
}

module.exports = {
  splitString,
  findSubstring,
  matchPattern,
};
