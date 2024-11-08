'use strict';

const isGlob = require('is-glob');
const pathPosixDirname = require('path').posix.dirname;
const isWin32 = require('os').platform() === 'win32';

const slash = '/';
const backslash = /\\/g;
const escaped = /\\([!*?|[\](){}])/g;

/**
 * @param {string} str
 * @param {Object} opts
 * @param {boolean} [opts.flipBackslashes=true]
 */
module.exports = function globParent(str, opts) {
  const options = { flipBackslashes: true, ...opts };

  // Convert backslashes to forward slashes on Windows if necessary
  if (options.flipBackslashes && isWin32 && !str.includes(slash)) {
    str = str.replace(backslash, slash);
  }

  // Handle edge case for patterns ending with enclosures containing path separators
  if (isEnclosure(str)) {
    str += slash;
  }

  // Append a character to handle trailing slashes correctly
  str += 'a';

  // Loop to remove globby path parts
  do {
    str = pathPosixDirname(str);
  } while (isGlobby(str));

  // Return the cleaned path after stripping escape characters
  return str.replace(escaped, '$1');
};

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
  return foundIndex >= 0 && str.slice(foundIndex + 1, -1).includes(slash);
}

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
