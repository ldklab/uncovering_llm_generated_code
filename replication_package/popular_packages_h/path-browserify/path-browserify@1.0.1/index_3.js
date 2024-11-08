'use strict';

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  
  for (var i = 0; i <= path.length; ++i) {
    code = i < path.length ? path.charCodeAt(i) : 47; // '/'
    
    if (code === 47 /* '/' */) {
      if (lastSlash !== i - 1 && dots > 1) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /* '.' */ || res.charCodeAt(res.length - 2) !== 46) {
          var lastSlashIndex;
          if (res.length > 2 && (lastSlashIndex = res.lastIndexOf('/')) !== res.length - 1) {
            res = lastSlashIndex === -1 ? '' : res.slice(0, lastSlashIndex);
            lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
          } else if (res.length <= 2) {
            res = '';
            lastSegmentLength = 0;
          }
        }
        if (allowAboveRoot) {
          res = res.length > 0 ? res + '/..' : '..';
          lastSegmentLength = 2;
        }
      } else if (res.length > 0) {
        res += '/' + path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /* '.' */) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  const { root, dir = root, base, name = '', ext = '' } = pathObject;
  const resolvedBase = base || name + ext;
  return dir === root ? dir + resolvedBase : dir + sep + resolvedBase;
}

var posix = {
  resolve: function resolve() {
    let resolvedPath = '';
    let resolvedAbsolute = false;
    let cwd;
  
    for (let i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      const path = (i >= 0) ? arguments[i] : (cwd = cwd || process.cwd());
      assertPath(path);
      if (path.length === 0) continue;
      
      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47; // '/'
    }
  
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);
    return resolvedAbsolute ? '/' + resolvedPath : (resolvedPath || '.');
  },
  
  normalize: function normalize(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    
    const isAbsolute = path.charCodeAt(0) === 47; // '/'
    const trailingSeparator = path.charCodeAt(path.length - 1) === 47; // '/'
    
    path = normalizeStringPosix(path, !isAbsolute);
    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';
    
    return isAbsolute ? '/' + path : path;
  },
  
  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47; // '/'
  },
  
  join: function join() {
    if (arguments.length === 0) return '.';
    let joined;
    for (let i = 0; i < arguments.length; ++i) {
      const arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        joined = joined === undefined ? arg : joined + '/' + arg;
      }
    }
    return joined === undefined ? '.' : posix.normalize(joined);
  },
  
  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);
  
    if (from === to) return '';
  
    from = posix.resolve(from);
    to = posix.resolve(to);
  
    if (from === to) return '';
  
    let fromStart = 1;
    for (; fromStart < from.length && from.charCodeAt(fromStart) === 47; ++fromStart);
    let fromEnd = from.length;
    const fromLen = fromEnd - fromStart;
    
    let toStart = 1;
    for (; toStart < to.length && to.charCodeAt(toStart) === 47; ++toStart);
    let toEnd = to.length;
    const toLen = toEnd - toStart;
  
    const length = Math.min(fromLen, toLen);
    let lastCommonSep = -1;
    let i = 0;
    for (; i <= length; ++i) {
      if (i === length || from.charCodeAt(fromStart + i) !== to.charCodeAt(toStart + i)) break;
      if (from.charCodeAt(fromStart + i) === 47) lastCommonSep = i;
    }
  
    let out = '';
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47) {
        out += out.length === 0 ? '..' : '/..';
      }
    }
  
    return out + to.slice(toStart + lastCommonSep + 1);
  },
  
  _makeLong: function _makeLong(path) {
    return path;
  },
  
  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    const hasRoot = path.charCodeAt(0) === 47;
    let end = -1;
    let matchedSlash = true;
    for (let i = path.length - 1; i >= 1; --i) {
      const code = path.charCodeAt(i);
      if (code === 47) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
        matchedSlash = false;
      }
    }
    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },
  
  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') {
      throw new TypeError('"ext" argument must be a string');
    }
    assertPath(path);
  
    let start = 0;
    let end = -1;
    let matchedSlash = true;
  
    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext === path) return '';
      let extIdx = ext.length - 1;
      let firstNonSlashEnd = -1;
      for (let i = path.length - 1; i >= 0; --i) {
        const code = path.charCodeAt(i);
        if (code === 47) {
          if (!matchedSlash) {
            start = i + 1;
            break;
          }
        } else {
          if (firstNonSlashEnd === -1) {
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0 && code === ext.charCodeAt(extIdx)) {
            if (--extIdx === -1) {
              end = i;
            }
          } else {
            extIdx = -1;
            end = firstNonSlashEnd;
          }
        }
      }
      if (start === end) end = firstNonSlashEnd;
      else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (let i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47) {
          if (!matchedSlash) {
            start = i + 1;
            break;
          }
        } else if (end === -1) {
          matchedSlash = false;
          end = i + 1;
        }
      }
      return end === -1 ? '' : path.slice(start, end);
    }
  },
  
  extname: function extname(path) {
    assertPath(path);
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
  
    for (let i = path.length - 1; i >= 0; --i) {
      const code = path.charCodeAt(i);
      if (code === 47) {
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
      if (code === 46) {
        if (startDot === -1) startDot = i;
        else if (preDotState !== 1) preDotState = 1;
      } else if (startDot !== -1) {
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        preDotState === 0 ||
        (preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)) {
      return '';
    }
    return path.slice(startDot, end);
  },
  
  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },
  
  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
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

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;
module.exports = posix;
