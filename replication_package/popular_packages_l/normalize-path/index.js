function normalizePath(path, stripTrailing = true) {
  if (typeof path !== 'string') {
    throw new TypeError('Expected a string');
  }

  // Check for Windows namespace
  const isWinNamespace = path.startsWith('\\\\.\\') || path.startsWith('\\\\?\\');
  
  if (isWinNamespace) {
    // Normalize starting double backslashes for win32 namespaces
    path = path.replace(/\\/g, '/');
  } else {
    // Replace backslashes with forward slashes
    path = path.replace(/[\\/]+/g, '/'); // condense slashes
  }

  // Remove trailing slash if stripTrailing is not explicitly set to false
  if (stripTrailing) {
    path = path.replace(/\/$/, '');
  }

  return path;
}

module.exports = normalizePath;

// Usage example
const normalize = require('./normalize-path');

console.log(normalize('\\foo\\bar\\baz\\')); 
//=> '/foo/bar/baz'

console.log(normalize('\\\\?\\UNC\\Server01\\user\\docs\\Letter.txt')); 
//=> '//?/UNC/Server01/user/docs/Letter.txt'

console.log(normalize('.//foo//bar///////baz/')); 
//=> './foo/bar/baz'

console.log(normalize('foo\\bar\\baz\\', false)); 
//=> 'foo/bar/baz/'
