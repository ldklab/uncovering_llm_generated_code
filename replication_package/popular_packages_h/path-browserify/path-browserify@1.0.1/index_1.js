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
  let code;

  for (let i = 0; i <= path.length; ++i) {
    code = (i < path.length) ? path.charCodeAt(i) : 47;

    if (code === 47 /*/*/) {
      if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.substr(-2) !== '..') {
          let lastSlashIndex = res.lastIndexOf('/');
          if (lastSlashIndex > -1) {
            res = res.slice(0, lastSlashIndex);
            lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
          } else {
            res = '';
            lastSegmentLength = 0;
          }
          lastSlash = i;
          dots = 0;
          continue;
        }
      }
      if (dots !== 1 && (res.length > 0 || allowAboveRoot)) {
        res += '/..';
        lastSegmentLength = 2;
      }
      if (lastSlash !== i - 1 && dots !== 2) {
        res += '/' + path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      dots++;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, { dir = '', root = '', base = '', name = '', ext = '' }) {
  dir = dir || root;
  base = base || (name + ext);
  if (!dir) return base;
  return dir === root ? dir + base : dir + sep + base;
}

const posix = {
  resolve(...args) {
    let resolvedPath = '';
    let resolvedAbsolute = false;
    let cwd = process.cwd();

    for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      let path = (i >= 0) ? args[i] : cwd;
      assertPath(path);

      if (path.length === 0) continue;

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47;
    }

    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);
    return resolvedAbsolute ? ('/' + resolvedPath) : (resolvedPath || '.');
  },

  normalize(path) {
    assertPath(path);
    if (path.length === 0) return '.';

    const isAbsolute = path.charCodeAt(0) === 47;
    const trailingSeparator = path.charCodeAt(path.length - 1) === 47;

    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (trailingSeparator) path += '/';

    return isAbsolute ? ('/' + path) : path;
  },

  isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47;
  },

  join(...paths) {
    let joined = paths.reduce((joined, arg) => {
      assertPath(arg);
      if (arg.length > 0) {
        joined = (joined === undefined) ? arg : (joined + '/' + arg);
      }
      return joined;
    }, undefined);

    return joined === undefined ? '.' : posix.normalize(joined);
  },

  relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    [from, to] = [posix.resolve(from), posix.resolve(to)];
    if (from === to) return '';

    const fromStart = from.slice(1).search(/[^\/]/g) + 1;
    const toStart = to.slice(1).search(/[^\/]/g) + 1;

    let length = Math.min(from.length - fromStart, to.length - toStart);
    let lastCommonSep = -1;

    for (let i = 0; i <= length; i++) {
      if (i === length || from[fromStart + i] !== to[toStart + i]) {
        break;
      } else if (from[fromStart + i] === '/'){
        lastCommonSep = i;
      }
    }

    let out = '';
    for (let i = fromStart + lastCommonSep + 1; i <= from.length; i++) {
      if (i === from.length || from[i] === '/') {
        out += out.length === 0 ? '..' : '/..';
      }
    }

    toStart += lastCommonSep;
    if (to.charCodeAt(toStart) === 47) ++toStart;

    return out + to.slice(toStart);
  },

  _makeLong(path) {
    return path;
  },
  
  dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    const hasRoot = path.charCodeAt(0) === 47;
    let end = -1;
    let matchedSlash = true;
    for (let i = path.length - 1; i >= 1; --i) {
      if (path.charCodeAt(i) === 47) {
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

  basename(path, ext) {
    assertPath(path);
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    
    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      let extIdx = ext.length - 1;
      let firstNonSlashEnd = -1;
      for (let i = path.length - 1; i >= 0; --i) {
        let code = path.charCodeAt(i);
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
          if (extIdx >= 0) {
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) end = i;
            } else {
              extIdx = -1;
              end = firstNonSlashEnd;
            }
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
      if (end === -1) return '';
      return path.slice(start, end);
    }
  },
  
  extname(path) {
    assertPath(path);
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    for (let i = path.length - 1; i >= 0; --i) {
      let code = path.charCodeAt(i);
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
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format('/', pathObject);
  },

  parse(path) {
    assertPath(path);

    let ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    const isAbsolute = path.charCodeAt(0) === 47;
    const start = isAbsolute ? 1 : 0;
    let startDot = -1, startPart = 0, end = -1;
    let matchedSlash = true, preDotState = 0;
    for (let i = path.length - 1; i >= start; --i) {
      let code = path.charCodeAt(i);
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
    if (end !== -1) {
      if (!isAbsolute && (startDot === -1 || preDotState === 0 || (preDotState === 1 && startDot === end - 1 && startDot === startPart + 1))) {
        ret.base = ret.name = path.slice(startPart, end);
      } else {
        if (isAbsolute) {
          ret.name = path.slice(1, startDot);
          ret.base = path.slice(1, end);
        } else {
          ret.name = path.slice(startPart, startDot);
          ret.base = path.slice(startPart, end);
        }
        ret.ext = path.slice(startDot, end);
      }
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
