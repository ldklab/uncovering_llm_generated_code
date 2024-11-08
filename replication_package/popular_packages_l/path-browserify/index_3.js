// path-browserify.js rewritten

const path = {
  resolve(...args) {
    let resolvedPath = '';
    let resolvedAbsolute = false;

    for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      const currentPath = i >= 0 ? args[i] : process.cwd();
      resolvedPath = `${currentPath}/${resolvedPath}`;
      resolvedAbsolute = currentPath.startsWith('/');
    }

    resolvedPath = this.normalizeArray(resolvedPath.split('/'), !resolvedAbsolute).join('/');
    return (resolvedAbsolute ? '/' : '') + (resolvedPath || '.');
  },

  normalize(pathStr) {
    const isAbsolute = this.isAbsolute(pathStr);
    const trailingSlash = pathStr.endsWith('/');
    pathStr = this.normalizeArray(pathStr.split('/').filter(Boolean), !isAbsolute).join('/');

    if (!pathStr && !isAbsolute) pathStr = '.';
    if (pathStr && trailingSlash) pathStr += '/';

    return (isAbsolute ? '/' : '') + pathStr;
  },

  isAbsolute(pathStr) {
    return pathStr.startsWith('/');
  },

  join(...paths) {
    return this.normalize(paths.filter(p => {
      if (typeof p !== 'string') {
        throw new TypeError('Arguments to path.join must be strings');
      }
      return p;
    }).join('/'));
  },

  dirname(pathStr) {
    if (typeof pathStr !== 'string') pathStr += '';
    if (!pathStr.length) return '.';

    const hasRoot = pathStr.startsWith('/');
    let end = -1;
    let matchedSlash = true;

    for (let i = pathStr.length - 1; i >= 1; --i) {
      if (pathStr[i] === '/') {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
        matchedSlash = false;
      }
    }
    return end === -1 ? (hasRoot ? '/' : '.') : pathStr.slice(0, end);
  },

  extname(pathStr) {
    if (typeof pathStr !== 'string') pathStr += '';
    let lastDot = -1;
    let lastSlash = -1;

    for (let i = pathStr.length - 1; i >= 0; --i) {
      if (pathStr[i] === '.') {
        if (lastDot === -1) {
          lastDot = i;
        } else {
          break;
        }
      } else if (pathStr[i] === '/') {
        lastSlash = i;
        break;
      }
    }
    return (lastDot !== -1 && (lastSlash === -1 || lastSlash < lastDot)) ? pathStr.slice(lastDot) : '';
  },

  normalizeArray(parts, allowAboveRoot) {
    let up = 0;
    for (let i = parts.length - 1; i >= 0; i--) {
      if (parts[i] === '.') {
        parts.splice(i, 1);
      } else if (parts[i] === '..') {
        parts.splice(i, 1);
        up++;
      } else if (up) {
        parts.splice(i, 1);
        up--;
      }
    }

    if (allowAboveRoot) {
      parts.unshift(...Array(up).fill('..'));
    }
    
    return parts;
  }
};

module.exports = path;
