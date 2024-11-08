module.exports = function normalizePath(path, stripTrailing) {
  if (typeof path !== 'string') {
    throw new TypeError('expected path to be a string');
  }

  if (path === '\\' || path === '/') return '/';

  const len = path.length;
  if (len <= 1) return path;

  let prefix = '';
  if (len > 4 && path[3] === '\\') {
    const ch = path[2];
    if ((ch === '?' || ch === '.') && path.startsWith('\\\\')) {
      path = path.slice(2);
      prefix = '//';
    }
  }

  const segments = path.split(/[\\/]+/);
  if (stripTrailing !== false && segments[segments.length - 1] === '') {
    segments.pop();
  }

  return prefix + segments.join('/');
};
