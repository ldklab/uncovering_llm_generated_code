// Import built-in 'path' module for browser-based environments
var path = {
  // Combines paths and resolves them into an absolute path
  resolve: function() {
    var resolvedPath = '',
        resolvedAbsolute = false;

    // Iterate over input paths starting from the last one
    for(var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var currentPath = (i >= 0) ? arguments[i] : process.cwd();
      resolvedPath = currentPath + '/' + resolvedPath;
      resolvedAbsolute = currentPath.charAt(0) === '/';
    }

    resolvedPath = this.normalizeArray(resolvedPath.split('/'), !resolvedAbsolute).join('/');

    return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
  },

  // Normalize the given path, resolving '..' and '.' segments
  normalize: function(path) {
    var isAbsolute = this.isAbsolute(path),
        trailingSlash = path.substr(-1) === '/';

    path = this.normalizeArray(path.split('/').filter(Boolean), !isAbsolute).join('/');

    if (!path && !isAbsolute) {
      path = '.';
    }
    if (path && trailingSlash) {
      path += '/';
    }

    return (isAbsolute ? '/' : '') + path;
  },

  // Determines if the path is absolute
  isAbsolute: function(path) {
    return path.charAt(0) === '/';
  },

  // Joins multiple string paths into one
  join: function() {
    var paths = Array.prototype.slice.call(arguments, 0);
    return this.normalize(paths.filter(function(p) {
      if (typeof p !== 'string') {
        throw new TypeError('Arguments to path.join must be strings');
      }
      return p;
    }).join('/'));
  },

  // Return the directory name of a path
  dirname: function(path) {
    path = (typeof path !== 'string') ? path + '' : path;

    if (path.length === 0) return '.';

    var hasRoot = path.charAt(0) === '/',
        end = -1,
        matchedSlash = true;

    for (var i = path.length - 1; i >= 1; --i) {
      if (path.charAt(i) === '/') {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    return path.slice(0, end);
  },

  // Get the file extension from path
  extname: function(path) {
    path = (typeof path !== 'string') ? path + '' : path;

    var lastDot = -1,
        lastSlash = -1,
        ext = '';

    for (var i = path.length - 1; i >= 0; --i) {
      if (path.charAt(i) === '.') {
        if (lastDot === -1) {
          lastDot = i;
        } else {
          break;
        }
      } else if (path.charAt(i) === '/') {
        lastSlash = i;
        break;
      }
    }

    if (lastDot !== -1 && (lastSlash === -1 || lastSlash < lastDot)) {
      ext = path.slice(lastDot);
    }

    return ext;
  },

  // Helps in normalizing array of path segments
  normalizeArray: function(parts, allowAboveRoot) {
    var up = 0;
    for (var i = parts.length - 1; i >= 0; i--) {
      var last = parts[i];
      if (last === '.') {
        parts.splice(i, 1);
      } else if (last === '..') {
        parts.splice(i, 1);
        up++;
      } else if (up) {
        parts.splice(i, 1);
        up--;
      }
    }

    if (allowAboveRoot) {
      for (; up--; up) {
        parts.unshift('..');
      }
    }

    return parts;
  }
};

module.exports = path;
