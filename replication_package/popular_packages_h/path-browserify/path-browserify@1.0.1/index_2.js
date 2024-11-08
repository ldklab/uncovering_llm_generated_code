'use strict';

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError(`Path must be a string. Received ${JSON.stringify(path)}`);
  }
}

function normalizeStringPosix(path, allowAboveRoot) {
  let res = '';
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  
  for (let i = 0; i <= path.length; i++) {
    let code = path.charCodeAt(i);
    
    if (i === path.length || code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (dots === 2) {
        if (res.length > 0 && lastSegmentLength === 2 && res.endsWith('..')) {
          if (allowAboveRoot) res += '/..';
        } else {
          const lastSlashIndex = res.lastIndexOf('/');
          if (lastSlashIndex > -1) {
            res = res.slice(0, lastSlashIndex);
            lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
          } else {
            res = '';
            lastSegmentLength = 0;
          }
        }
      } else {
        if (res.length > 0) {
          res += '/' + path.slice(lastSlash + 1, i);
        } else {
          res = path.slice(lastSlash + 1, i);
        }
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/) {
      dots++;
    } else {
      dots = -1;
    }
  }
  
  return res;
}

function _format(sep, pathObject) {
  const dir = pathObject.dir || pathObject.root;
  const base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  return dir ? `${dir}${dir === pathObject.root ? '' : sep}${base}` : base;
}

const posix = {
  resolve(...args) {
    let resolvedPath = '';
    let resolvedAbsolute = false;
    let cwd;

    for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      const path = i >= 0 ? args[i] : (cwd ??= process.cwd());

      assertPath(path);

      if (path.length === 0) continue;

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);
    return resolvedAbsolute ? `/${resolvedPath}` : resolvedPath || '.';
  },

  normalize(path) {
    assertPath(path);
    if (path.length === 0) return '.';

    const isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    const trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    return isAbsolute ? `/${path}` : path;
  },

  isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join(...paths) {
    let joined = paths
      .map(arg => {
        assertPath(arg);
        return arg;
      })
      .filter(arg => arg.length > 0)
      .join('/');
    return joined ? posix.normalize(joined) : '.';
  },

  relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    const fromStart = from.indexOf('/') + 1;
    const toStart = to.indexOf('/') + 1;

    const length = Math.min(from.length - fromStart, to.length - toStart);
    let lastCommonSep = -1;
    for (let i = 0; i <= length; i++) {
      if (from.charCodeAt(fromStart + i) !== to.charCodeAt(toStart + i)) break;
      if (from.charCodeAt(fromStart + i) === 47 /*/*/) lastCommonSep = i;
    }

    const out = [];
    for (let i = fromStart + lastCommonSep + 1; i <= from.length - 1; i++) {
      if (i === from.length || from.charCodeAt(i) === 47 /*/*/) {
        out.push('..');
      }
    }
    
    return out.concat(to.slice(toStart + lastCommonSep + 1)).join('/') || '';
  },

  _makeLong: path => path,

  dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    const hasRoot = path.charCodeAt(0) === 47 /*/*/;
    let end = -1, matchedSlash = true;

    for (let i = path.length - 1; i >= 1; i--) {
      if (path.charCodeAt(i) === 47 /*/*/) {
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

  basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    let start = 0, end = -1, matchedSlash = true;
    let extIdx = ext ? ext.length - 1 : -1;
    let firstNonSlashEnd = -1;

    for (let i = path.length - 1; i >= 0; --i) {
      const code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else {
        if (firstNonSlashEnd === -1) {
          matchedSlash = false;
          firstNonSlashEnd = i + 1;
        }
        if (ext && extIdx >= 0 && code === ext.charCodeAt(extIdx)) {
          if (--extIdx === -1) {
            end = i;
          }
        } else {
          end = firstNonSlashEnd;
        }
      }
    }

    if (start !== end) return path.slice(start || 0, end || firstNonSlashEnd);
    if (end === -1) return '';
    return path.slice(start, end);
  },

  extname(path) {
    assertPath(path);

    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    const preDotState = 0;

    for (let i = path.length - 1; i >= 0; i--) {
      const code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }

      if (end === -1) {
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
        if (startDot === -1) startDot = i;
        if (preDotState !== 1) preDotState = 1;
      } else if (startDot !== -1) {
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 || !preDotState || (preDotState === 1 && startDot === end - 1)) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format(pathObject) {
    if (!pathObject || typeof pathObject !== 'object') {
      throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format('/', pathObject);
  },

  parse(path) {
    assertPath(path);

    const ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (!path.length) return ret;

    const isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    const start = isAbsolute ? 1 : 0;
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;

    for (let i = path.length - 1; i >= start; i--) {
      const code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }

      if (end === -1) {
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
        if (startDot === -1) startDot = i;
        preDotState = 1;
      } else if (startDot !== -1) {
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 || (preDotState !== 0 && (preDotState !== 1 || startDot !== end - 1 || startDot === startPart + 1))) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) {
          ret.base = ret.name = path.slice(1, end);
        } else {
          ret.base = ret.name = path.slice(startPart, end);
        }
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);
    else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;
