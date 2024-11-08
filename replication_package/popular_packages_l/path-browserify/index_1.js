// Modern Path Utility Implementation

const path = {
  resolve: function(...args) {
    let resolvedPath = '';
    let resolvedAbsolute = false;

    for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      const currentPath = i >= 0 ? args[i] : process.cwd();
      resolvedPath = currentPath + '/' + resolvedPath;
      resolvedAbsolute = currentPath.startsWith('/');
    }

    resolvedPath = this.normalizeArray(resolvedPath.split('/'), !resolvedAbsolute).join('/');
    return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
  },

  normalize: function(path) {
    const isAbsolute = this.isAbsolute(path);
    const trailingSlash = path.endsWith('/');

    path = this.normalizeArray(path.split('/').filter(Boolean), !isAbsolute).join('/');

    if (!path && !isAbsolute) {
      path = '.';
    }
    if (trailingSlash) {
      path += '/';
    }

    return (isAbsolute ? '/' : '') + path;
  },

  isAbsolute: function(path) {
    return path.startsWith('/');
  },

  join: function(...paths) {
    return this.normalize(paths.filter(p => {
      if (typeof p !== 'string') {
        throw new TypeError('Arguments to path.join must be strings');
      }
      return p;
    }).join('/'));
  },

  dirname: function(path) {
    if (typeof path !== 'string') path = String(path);

    if (!path.length) return '.';

    const hasRoot = path.startsWith('/');
    let end = -1;
    let matchedSlash = true;

    for (let i = path.length - 1; i >= 1; --i) {
      if (path[i] === '/') {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
        matchedSlash = false;
      }
    }

    return end === -1 ? (hasRoot ? '/' : '.') : path.slice(0, end);
  },

  extname: function(path) {
    if (typeof path !== 'string') path = String(path);

    let lastDot = -1;
    let lastSlash = -1;

    for (let i = path.length - 1; i >= 0; --i) {
      if (path[i] === '.') {
        if (lastDot === -1) lastDot = i;
      } else if (path[i] === '/') {
        lastSlash = i;
        break;
      }
    }

    return (lastDot !== -1 && (lastSlash === -1 || lastSlash < lastDot))
      ? path.slice(lastDot)
      : '';
  },

  normalizeArray: function(parts, allowAboveRoot) {
    let up = 0;
    for (let i = parts.length - 1; i >= 0; i--) {
      const last = parts[i];
      if (last === '.') {
        parts.splice(i, 1);
      } else if (last === '..') {
        parts.splice(i, 1);
        up++;
      } else if (up > 0) {
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
