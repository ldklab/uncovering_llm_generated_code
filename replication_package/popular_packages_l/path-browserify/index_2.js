// path-browserify.js

var path = {
  resolve: function(...args) {
    let resolvedPath = '', resolvedAbsolute = false;

    for(let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      const currentPath = (i >= 0) ? args[i] : process.cwd();

      resolvedPath = currentPath + '/' + resolvedPath;
      resolvedAbsolute = currentPath.startsWith('/');
    }

    resolvedPath = this.normalizeArray(resolvedPath.split('/'), !resolvedAbsolute).join('/');

    return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
  },

  normalize: function(inputPath) {
    const isAbsolute = this.isAbsolute(inputPath);
    const trailingSlash = inputPath.endsWith('/');

    inputPath = this.normalizeArray(inputPath
      .split('/')
      .filter(Boolean), 
      !isAbsolute
    ).join('/');

    if (!inputPath && !isAbsolute) {
      inputPath = '.';
    }
    if (inputPath && trailingSlash) {
      inputPath += '/';
    }

    return (isAbsolute ? '/' : '') + inputPath;
  },

  isAbsolute: function(inputPath) {
    return inputPath.startsWith('/');
  },

  join: function(...paths) {
    return this.normalize(
      paths.filter(path => {
        if (typeof path !== 'string') {
          throw new TypeError('Arguments to path.join must be strings');
        }
        return path;
      }).join('/')
    );
  },

  dirname: function(inputPath) {
    if (typeof inputPath !== 'string') inputPath += '';

    if (inputPath.length === 0) return '.';

    const hasRoot = inputPath.charAt(0) === '/';
    let end = -1, matchedSlash = true;

    for (let i = inputPath.length - 1; i >= 1; --i) {
      if (inputPath.charAt(i) === '/') {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    return inputPath.slice(0, end);
  },

  extname: function(inputPath) {
    if (typeof inputPath !== 'string') inputPath += '';
    let lastDot = -1, lastSlash = -1, ext = '';

    for (let i = inputPath.length - 1; i >= 0; --i) {
      if (inputPath.charAt(i) === '.') {
        if (lastDot === -1) {
          lastDot = i;
        } else {
          break;
        }
      } else if (inputPath.charAt(i) === '/') {
        lastSlash = i;
        break;
      }
    }

    if (lastDot !== -1 && (lastSlash === -1 || lastSlash < lastDot)) {
      ext = inputPath.slice(lastDot);
    }

    return ext;
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
      } else if (up) {
        parts.splice(i, 1);
        up--;
      }
    }

    if (allowAboveRoot) {
      for (; up > 0; up--) {
        parts.unshift('..');
      }
    }

    return parts;
  }
};

module.exports = path;
