function normalizePath(path, stripTrailing = true) {
  if (typeof path !== 'string') {
    throw new TypeError('Expected a string');
  }

  const isWinNamespace = path.startsWith('\\\\.\\') || path.startsWith('\\\\?\\');

  if (isWinNamespace) {
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

const normalize = require('./normalize-path');

console.log(normalize('\\foo\\bar\\baz\\')); 
console.log(normalize('\\\\?\\UNC\\Server01\\user\\docs\\Letter.txt')); 
console.log(normalize('.//foo//bar///////baz/')); 
console.log(normalize('foo\\bar\\baz\\', false)); 
