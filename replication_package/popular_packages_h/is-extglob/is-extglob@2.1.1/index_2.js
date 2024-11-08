/*!
 * is-extglob <https://github.com/jonschlinkert/is-extglob>
 *
 * Copyright (c) 2014-2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

module.exports = function isExtglob(input) {
  if (typeof input !== 'string' || input === '') {
    return false;
  }

  let extglobPattern = /(?:\\.)|(?:[@?!+*]\(.*?\))/g;
  let foundMatch;

  while ((foundMatch = extglobPattern.exec(input))) {
    if (foundMatch[0][0] !== '\\') {
      return true;
    }
    input = input.slice(foundMatch.index + foundMatch[0].length);
  }
  return false;
};
