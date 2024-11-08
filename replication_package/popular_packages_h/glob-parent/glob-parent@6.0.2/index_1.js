'use strict';

const isGlob = require('is-glob');
const pathPosixDirname = require('path').posix.dirname;
const isWin32 = require('os').platform() === 'win32';

const slash = '/';
const backslash = /\\/g;
const escaped = /\\([!*?|[\](){}])/g;

/**
 * Determines the parent directory path of a given glob pattern path.
 * 
 * @param {string} str - The glob pattern or directory path.
 * @param {Object} opts - Options object.
 * @param {boolean} [opts.flipBackslashes=true] - Whether to replace backslashes with slashes on Windows.
 * @returns {string} - The parent directory path.
 */
module.exports = function globParent(str, opts) {
  const options = Object.assign({ flipBackslashes: true }, opts);

  // Convert backslashes to slashes on Windows.
  if (options.flipBackslashes && isWin32 && !str.includes(slash)) {
    str = str.replace(backslash, slash);
  }

  // Handle paths ending with special enclosures.
  if (isEnclosure(str)) {
    str += slash;
  }

  // Append character to preserve trailing slash.
  str += 'a';

  // Continuously remove globby parts until base path is found.
  do {
    str = pathPosixDirname(str);
  } while (isGlobby(str));

  // Return path with escape characters removed.
  return str.replace(escaped, '$1');
};

/**
 * Determines if a string ends with an enclosure and contains a slash within.
 * 
 * @param {string} str - The path string to check.
 * @returns {boolean} - True if it ends with an enclosure and contains a slash.
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
 * Determines if a string is a glob pattern.
 * 
 * @param {string} str - String to evaluate.
 * @returns {boolean} - True if the string is a glob pattern.
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
