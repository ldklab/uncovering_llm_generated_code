module.exports = function normalizePath(inputPath, stripTrailing = true) {
  if (typeof inputPath !== 'string') {
    throw new TypeError('expected path to be a string');
  }

  if (inputPath === '\\' || inputPath === '/') return '/';

  const pathLength = inputPath.length;
  if (pathLength <= 1) return inputPath;

  let prefix = '';
  if (pathLength > 4 && inputPath.startsWith('\\\\')) {
    const possibleNamespaceChar = inputPath[2];
    if ((possibleNamespaceChar === '?' || possibleNamespaceChar === '.') && inputPath[3] === '\\') {
      inputPath = inputPath.slice(2);
      prefix = '//';
    }
  }

  const segments = inputPath.split(/[/\\]+/);
  if (stripTrailing && segments[segments.length - 1] === '') {
    segments.pop();
  }

  return prefix + segments.join('/');
};
