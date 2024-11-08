'use strict';

const isGlob = require('is-glob');
const pathPosixDirname = require('path').posix.dirname;
const isWin32 = require('os').platform() === 'win32';

const slash = '/';
const backslash = /\\/g;
const enclosure = /[\{\[].*[\/]*.*[\}\]]$/;
const globby = /(^|[^\\])([\{\[]|\([^\)]+$)/;
const escaped = /\\([\!\*\?\|\[\]\(\)\{\}])/g;

module.exports = function globParent(str, opts) {
  const options = { flipBackslashes: true, ...opts };

  if (options.flipBackslashes && isWin32 && !str.includes(slash)) {
    str = str.replace(backslash, slash);
  }

  if (enclosure.test(str)) {
    str += slash;
  }

  str += 'a';

  do {
    str = pathPosixDirname(str);
  } while (isGlob(str) || globby.test(str));

  return str.replace(escaped, '$1');
};
