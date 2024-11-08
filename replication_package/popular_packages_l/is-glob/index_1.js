function isGlob(str, options = {}) {
  if (typeof str !== 'string') {
    return false;
  }

  const strictMode = options.strict !== false;

  // Prepare regular expressions for both strict and non-strict modes
  const patternForGlob = strictMode ? /(^.*([*?{}()[\]!+]|(!)+(?=\())+.*$)/ : /([*?{}()[\]!+])/;
  const extglobPattern = strictMode ? /(\\\!|\\\*|\\\)|\\\]|\\\(|\\\{|\\@|\\\+|\\\?|\(+(?=\())/ : /(\\\!|\\\*|\\\|\\\)|\\\]|\\\(|\\\{|\\@|\\\+)/;

  // Return true if the pattern matches and does not match extglob
  return patternForGlob.test(str) && !extglobPattern.test(str);
}

module.exports = isGlob;

// Example usage:
// const isGlob = require('./is-glob');

// console.log(isGlob('!foo.js')); // true
// console.log(isGlob('abc/\\*.js')); // false
// console.log(isGlob('abc.js')); // false
// console.log(isGlob(['**/*.js'])); // false
// console.log(isGlob('*.js', { strict: false })); // true
