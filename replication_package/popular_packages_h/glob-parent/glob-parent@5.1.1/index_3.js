'use strict';

const isGlob = require('is-glob');
const { posix: { dirname } } = require('path');
const isWin32 = require('os').platform() === 'win32';

const slash = '/';
const backslash = /\\/g;
const enclosurePattern = /[\{\[].*[\/]*.*[\}\]]$/;
const globbyPattern = /(^|[^\\])([\{\[]|\([^\)]+$)/;
const escapePattern = /\\([\!\*\?\|\[\]\(\)\{\}])/g;

/**
 * Determines the parent path of a given glob pattern.
 * 
 * @param {string} pattern - The glob pattern string.
 * @param {Object} [options={}] - Options to modify behavior.
 * @param {boolean} [options.flipBackslashes=true] - Whether to flip backslashes to forward slashes (mainly for Windows).
 * @returns {string} - The parent path of the glob pattern.
 */
module.exports = function globParent(pattern, options = {}) {
  const opts = { flipBackslashes: true, ...options };

  // Modify Windows backslashes to forward slashes if enabled
  if (opts.flipBackslashes && isWin32 && !pattern.includes(slash)) {
    pattern = pattern.replace(backslash, slash);
  }

  // Append a slash if pattern matches certain enclosure pattern
  if (enclosurePattern.test(pattern)) {
    pattern += slash;
  }

  // Append a placeholder character to manage cases with trailing slashes
  pattern += 'a';

  // Strip away glob patterns
  do {
    pattern = dirname(pattern);
  } while (isGlob(pattern) || globbyPattern.test(pattern));

  // Remove escape characters
  return pattern.replace(escapePattern, '$1');
};
