'use strict';

const isGlob = require('is-glob');
const { posix: { dirname: pathPosixDirname } } = require('path');
const isWin32 = require('os').platform() === 'win32';

const SLASH = '/';
const BACKSLASH_REGEX = /\\/g;
const ENCLOSURE_REGEX = /[\{\[].*[\/]*.*[\}\]]$/;
const GLOBBY_REGEX = /(^|[^\\])([\{\[]|\([^\)]+$)/;
const ESCAPED_REGEX = /\\([\!\*\?\|\[\]\(\)\{\}])/g;

/**
 * Determines the parent path of a glob pattern.
 * 
 * @param {string} str The path string containing a glob pattern.
 * @param {Object} opts Optional options object.
 * @param {boolean} [opts.flipBackslashes=true] Whether to convert backslashes to slashes on Windows systems.
 * @returns {string} The parent path of the glob pattern.
 */
module.exports = function globParent(str, opts) {
  const { flipBackslashes = true } = opts || {};

  // Flip Windows path separators if needed
  if (flipBackslashes && isWin32 && !str.includes(SLASH)) {
    str = str.replace(BACKSLASH_REGEX, SLASH);
  }

  // Handle enclosure with path separator special case
  if (ENCLOSURE_REGEX.test(str)) {
    str += SLASH;
  }

  // Append a character to handle trailing separators
  str += 'a';

  // Remove path parts containing glob patterns
  do {
    str = pathPosixDirname(str);
  } while (isGlob(str) || GLOBBY_REGEX.test(str));

  // Remove escape characters and return the result
  return str.replace(ESCAPED_REGEX, '$1');
};
