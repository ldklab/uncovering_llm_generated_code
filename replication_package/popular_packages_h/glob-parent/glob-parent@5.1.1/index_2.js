'use strict';

const isGlob = require('is-glob');
const path = require('path');
const os = require('os');

const slash = '/';
const backslash = /\\/g;
const enclosure = /[\{\[].*[\/]*.*[\}\]]$/;
const globby = /(^|[^\\])([\{\[]|\([^\)]+$)/;
const escaped = /\\([\!\*\?\|\[\]\(\)\{\}])/g;

const isWin32 = os.platform() === 'win32';

/**
 * @param {string} str - The path string to process.
 * @param {Object} [opts] - Options for processing.
 * @param {boolean} [opts.flipBackslashes=true] - Whether to convert backslashes to slashes.
 * @returns {string} - The parent directory of the given path.
 */
module.exports = function globParent(str, opts = { flipBackslashes: true }) {
  const options = { flipBackslashes: true, ...opts };

  if (options.flipBackslashes && isWin32 && !str.includes(slash)) {
    str = str.replace(backslash, slash);
  }

  if (enclosure.test(str)) {
    str += slash;
  }

  str += 'a';

  do {
    str = path.posix.dirname(str);
  } while (isGlob(str) || globby.test(str));

  return str.replace(escaped, '$1');
};
