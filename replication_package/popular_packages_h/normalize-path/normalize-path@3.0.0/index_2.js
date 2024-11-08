module.exports = function normalizePath(path, stripTrailing) {
  if (typeof path !== 'string') {
    throw new TypeError('expected path to be a string');
  }

  // Immediately return '/' if the path is simply a single slash or backslash
  if (path === '\\' || path === '/') return '/';

  // Quick return for short paths
  var pathLength = path.length;
  if (pathLength <= 1) return path;

  // Handle win32 namespace paths (e.g., \\?\C:\ or \\.\C:\)
  var prefix = '';
  if (pathLength > 4 && path[3] === '\\') {
    var thirdChar = path[2];
    if ((thirdChar === '?' || thirdChar === '.') && path.startsWith('\\\\')) {
      path = path.slice(2);
      prefix = '//';
    }
  }

  // Split by both forward and back slashes and normalize
  var segments = path.split(/[/\\]+/);
  
  // Remove trailing empty segment unless stripTrailing is explicitly false
  if (stripTrailing !== false && segments[segments.length - 1] === '') {
    segments.pop();
  }

  // Join segments with single forward slashes
  return prefix + segments.join('/');
};
