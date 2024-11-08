function normalizePath(path, stripTrailing = true) {
  if (typeof path !== 'string') {
    throw new TypeError('Expected a string');
  }

  const isWindowsNamespace = path.startsWith('\\\\.\\') || path.startsWith('\\\\?\\');

  if (isWindowsNamespace) {
    path = path.replace(/\\/g, '/');
  } else {
    path = path.replace(/[\\/]+/g, '/');
  }

  if (stripTrailing) {
    path = path.replace(/\/$/, '');
  }

  return path;
}

module.exports = normalizePath;

// Usage example
const normalizePath = require('./normalize-path');

console.log(normalizePath('\\foo\\bar\\baz\\')); 
//=> '/foo/bar/baz'

console.log(normalizePath('\\\\?\\UNC\\Server01\\user\\docs\\Letter.txt')); 
//=> '//?/UNC/Server01/user/docs/Letter.txt'

console.log(normalizePath('.//foo//bar///////baz/')); 
//=> './foo/bar/baz'

console.log(normalizePath('foo\\bar\\baz\\', false)); 
//=> 'foo/bar/baz/'
