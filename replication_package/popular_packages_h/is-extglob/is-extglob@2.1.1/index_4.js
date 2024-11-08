/*!
 * is-extglob <https://github.com/jonschlinkert/is-extglob>
 *
 * Copyright (c) 2014-2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

module.exports = function isExtglob(str) {
  if (typeof str !== 'string' || str.length === 0) {
    return false;
  }

  const regex = /(\\).|([@?!+*]\(.*\))/g;
  let match;

  while ((match = regex.exec(str)) !== null) {
    if (match[2] !== undefined) {
      return true;
    }
    str = str.slice(match.index + match[0].length);
  }

  return false;
};
