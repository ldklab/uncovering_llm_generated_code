// is-glob.js

function isGlob(str, options = {}) {
  if (typeof str !== 'string') return false;

  const isStrictMode = options.strict !== false;
  const globPattern = isStrictMode ? /(^.*([*?{}()[\]!+]|(!)+(?=\())+.*$)/ : /([*?{}()[\]!+])/;
  const extGlobPattern = isStrictMode ? /(\\\!|\\\*|\\\)|\\\]|\\\(|\\\{|\\@|\\\+|\\\?|\(+(?=\())/ : /(\\\!|\\\*|\\\|\\\)|\\\]|\\\(|\\\{|\\@|\\\+)/;

  return globPattern.test(str) && !extGlobPattern.test(str);
}

module.exports = isGlob;

// Example usage:
// const isGlob = require('./is-glob');
// console.log(isGlob('!foo.js')); // true
// console.log(isGlob('abc/\\*.js')); // false
// console.log(isGlob('abc.js')); // false
// console.log(isGlob(['**/*.js'])); // false
// console.log(isGlob('*.js', { strict: false })); // true
