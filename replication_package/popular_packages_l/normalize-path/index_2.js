function normalizePath(path, stripTrailing = true) {
  // Ensure the path is a string
  if (typeof path !== 'string') {
    throw new TypeError('Expected a string');
  }

  // Determine if the path starts with a Windows-specific namespace
  const isWinNamespace = path.startsWith('\\\\.\\') || path.startsWith('\\\\?\\');

  if (isWinNamespace) {
    // For Windows namespaces, replace all backslashes with forward slashes
    path = path.replace(/\\/g, '/');
  } else {
    // For non-namespace paths, replace backslashes with forward slashes and condense multiple slashes
    path = path.replace(/[\\/]+/g, '/');
  }

  // Optionally remove a trailing slash, depending on the stripTrailing parameter
  if (stripTrailing) {
    path = path.replace(/\/$/, '');
  }

  return path;
}

module.exports = normalizePath;

// Usage demonstration
const normalize = require('./normalize-path');

console.log(normalize('\\foo\\bar\\baz\\')); 
// Output: '/foo/bar/baz'

console.log(normalize('\\\\?\\UNC\\Server01\\user\\docs\\Letter.txt')); 
// Output: '//?/UNC/Server01/user/docs/Letter.txt'

console.log(normalize('.//foo//bar///////baz/')); 
// Output: './foo/bar/baz'

console.log(normalize('foo\\bar\\baz\\', false)); 
// Output: 'foo/bar/baz/'
