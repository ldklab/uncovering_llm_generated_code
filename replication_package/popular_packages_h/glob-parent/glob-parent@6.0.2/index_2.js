'use strict';

const isGlob = require('is-glob');
const path = require('path');
const os = require('os');

const isWin32 = os.platform() === 'win32';
const slash = '/';
const backslash = /\\/g;
const escaped = /\\([!*?|[\](){}])/g;

/**
 * Determines the parent directory of a given path, handling globs and special characters.
 *
 * @param {string} str - The input path string.
 * @param {Object} opts
 * @param {boolean} [opts.flipBackslashes=true] - Whether to convert backslashes to slashes on Windows.
 * @returns {string} The parent directory path.
 */
function globParent(str, opts = {}) {
  const options = { flipBackslashes: true, ...opts };

  // On Windows, flip backslashes if needed
  if (options.flipBackslashes && isWin32 && !str.includes(slash)) {
    str = str.replace(backslash, slash);
  }

  // Append slash for paths ending in enclosures with slashes
  if (isEnclosure(str)) {
    str += slash;
  }

  // Add character to preserve possible trailing separators
  str += 'a';

  // Work backwards and strip to find the parent directory
  while (isGlobby(str)) {
    str = path.posix.dirname(str);
  }

  // Return cleaned-up string without escape characters
  return str.replace(escaped, '$1');
}

/**
 * Checks if the path ends in an enclosure containing a slash.
 *
 * @param {string} str - The string to check.
 * @returns {boolean} - True if ends in an enclosure, False otherwise.
 */
function isEnclosure(str) {
  const lastChar = str.slice(-1);
  const enclosureStart = lastChar === '}' ? '{' : lastChar === ']' ? '[' : null;
  
  if (!enclosureStart) {
    return false;
  }

  const foundIndex = str.indexOf(enclosureStart);
  if (foundIndex < 0) {
    return false;
  }

  return str.slice(foundIndex + 1, -1).includes(slash);
}

/**
 * Checks if the string includes glob patterns or special unescaped characters.
 *
 * @param {string} str - The string to check.
 * @returns {boolean} - True if the string is considered "globby".
 */
function isGlobby(str) {
  if (/\([^()]+$/.test(str)) {
    return true;
  }
  if (str.startsWith('{') || str.startsWith('[')) {
    return true;
  }
  if (/[^\\][{[]/.test(str)) {
    return true;
  }
  return isGlob(str);
}

module.exports = globParent;
