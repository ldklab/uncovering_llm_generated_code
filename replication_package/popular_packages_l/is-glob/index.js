// is-glob.js

function isGlob(str, options) {
  if (typeof str !== 'string') {
    return false;
  }

  options = options || {};
  const strict = options.strict !== false;

  // Regex patterns for normal and strict mode
  const globRegex = strict ? /(^.*([*?{}()[\]!+]|(!)+(?=\())+.*$)/ : /([*?{}()[\]!+])/;
  const extglobRegex = strict ? /(\\\!|\\\*|\\\)|\\\]|\\\(|\\\{|\\@|\\\+|\\\?|\(+(?=\())/ : /(\\\!|\\\*|\\\|\\\)|\\\]|\\\(|\\\{|\\@|\\\+)/;
  
  return globRegex.test(str) && !extglobRegex.test(str);
}

module.exports = isGlob;

// Example usage:
// var isGlob = require('./is-glob');

// console.log(isGlob('!foo.js')); // true
// console.log(isGlob('abc/\\*.js')); // false
// console.log(isGlob('abc.js')); // false
// console.log(isGlob(['**/*.js'])); // false
// console.log(isGlob('*.js', { strict: false })); // true
