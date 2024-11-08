// path-browserify.js

var path = {
  resolve: function() {
    var resolvedPath = '',
        resolvedAbsolute = false;

    for(var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var currentPath = (i >= 0) ? arguments[i] : process.cwd();

      resolvedPath = currentPath + '/' + resolvedPath;
      resolvedAbsolute = currentPath.charAt(0) === '/';
    }

    resolvedPath = this.normalizeArray(resolvedPath.split('/'), !resolvedAbsolute).join('/');

    return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
  },

  normalize: function(path) {
    var isAbsolute = this.isAbsolute(path),
        trailingSlash = path.substr(-1) === '/';

    path = this.normalizeArray(path.split('/').filter(function(p) {
      return !!p;
    }), !isAbsolute).join('/');

    if (!path && !isAbsolute) {
      path = '.';
    }
    if (path && trailingSlash) {
      path += '/';
    }

    return (isAbsolute ? '/' : '') + path;
  },

  isAbsolute: function(path) {
    return path.charAt(0) === '/';
  },

  join: function() {
    var paths = Array.prototype.slice.call(arguments, 0);
    return this.normalize(paths.filter(function(p) {
      if (typeof p !== 'string') {
        throw new TypeError('Arguments to path.join must be strings');
      }
      return p;
    }).join('/'));
  },

  dirname: function(path) {
    if (typeof path !== 'string') path += '';

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

  extname: function(path) {
    if (typeof path !== 'string') path += '';
    var lastDot = -1,
        lastSlash = -1,
        ext = '',
        i, len;

    for (i = path.length - 1; i >= 0; --i) {
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

  normalizeArray: function(parts, allowAboveRoot) {
    // if the path tries to go above the root, `up` ends up > 0
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

    // if the path is allowed to go above the root, restore leading ..s
    if (allowAboveRoot) {
      for (; up--; up) {
        parts.unshift('..');
      }
    }

    return parts;
  }
};

module.exports = path;
