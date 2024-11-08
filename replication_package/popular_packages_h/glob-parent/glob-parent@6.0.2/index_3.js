'use strict';

const isGlob = require('is-glob');
const path = require('path');
const os = require('os');

const pathPosixDirname = path.posix.dirname;
const isWin32 = os.platform() === 'win32';

const slash = '/';
const backslash = /\\/g;
const escaped = /\\([!*?|[\](){}])/g;

/**
 * Returns the parent directory of a glob pattern or path.
 * @param {string} str - The file path or glob pattern.
 * @param {Object} opts - Options object.
 * @param {boolean} [opts.flipBackslashes=true] - Flag to flip Windows backslashes to slashes.
 * @returns {string} The parent directory.
 */
module.exports = function globParent(str, opts = {}) {
  const options = Object.assign({ flipBackslashes: true }, opts);

  // Converts backslashes to slashes for Windows paths if the option is enabled
  if (options.flipBackslashes && isWin32 && str.indexOf(slash) < 0) {
    str = str.replace(backslash, slash);
  }

  // Handles special cases for strings ending with enclosures
  if (isEnclosure(str)) {
    str += slash;
  }

  // Ensure the path can be processed correctly
  str += 'a';

  // Remove parts of the path that contain glob patterns
  do {
    str = pathPosixDirname(str);
  } while (isGlobby(str));

  // Return the path with escape characters removed
  return str.replace(escaped, '$1');
};

/**
 * Checks if the string ends with an enclosure (e.g., {} or []) containing a path separator.
 * @param {string} str - The string to check.
 * @returns {boolean} True if it has an enclosure, false otherwise.
 */
function isEnclosure(str) {
  const lastChar = str.slice(-1);

  let enclosureStart;
  switch (lastChar) {
    case '}':
      enclosureStart = '{';
      break;
    case ']':
      enclosureStart = '[';
      break;
    default:
      return false;
  }

  const foundIndex = str.indexOf(enclosureStart);
  if (foundIndex < 0) {
    return false;
  }

  return str.slice(foundIndex + 1, -1).includes(slash);
}

/**
 * Checks if the string is a glob pattern or has a part that looks glob-like.
 * @param {string} str - The string to check.
 * @returns {boolean} True if it is globby, false otherwise.
 */
function isGlobby(str) {
  if (/\([^()]+$/.test(str)) {
    return true;
  }
  if (str[0] === '{' || str[0] === '[') {
    return true;
  }
  if (/[^\\][{[]/.test(str)) {
    return true;
  }
  return isGlob(str);
}
