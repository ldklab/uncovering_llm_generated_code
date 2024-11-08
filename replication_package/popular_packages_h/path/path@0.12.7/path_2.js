'use strict';

const isWindows = process.platform === 'win32';
const { isObject, isString } = require('util');

// Helper function to normalize paths by removing invalid elements like '.' and resolving '..'
function normalizeArray(parts, allowAboveRoot) {
  const res = [];
  for (const p of parts) {
    if (p && p !== '.') {
      if (p === '..') {
        if (res.length && res[res.length - 1] !== '..') {
          res.pop();
        } else if (allowAboveRoot) {
          res.push('..');
        }
      } else {
        res.push(p);
      }
    }
  }
  return res;
}

// Trims empty elements from path arrays
function trimArray(arr) {
  let start = 0;
  let end = arr.length - 1;
  while (start <= end && !arr[start]) start++;
  while (end > start && !arr[end]) end--;
  return arr.slice(start, end + 1);
}

// Windows-specific path utilities
const win32 = {
  // Regular expressions to parse Windows paths
  splitDeviceRe: /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/,
  splitTailRe: /^([\s\S]*?)((?:\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))(?:[\\\/]*)$/,

  resolve(...args) {
    let resolvedDevice = '', resolvedTail = '', resolvedAbsolute = false;

    for (let i = args.length - 1; i >= -1; i--) {
      let path = i >= 0 ? args[i] : (!resolvedDevice ? process.cwd() : process.env['=' + resolvedDevice] || resolvedDevice + '\\');
      if (isString(path) && path) {
        const result = win32StatPath(path);
        const { device, isUnc, isAbsolute, tail } = result;

        if (device && resolvedDevice && device.toLowerCase() !== resolvedDevice.toLowerCase()) continue;
        if (!resolvedDevice) resolvedDevice = device;
        if (!resolvedAbsolute) {
          resolvedTail = tail + '\\' + resolvedTail;
          resolvedAbsolute = isAbsolute;
        }
        if (resolvedDevice && resolvedAbsolute) break;
      }
    }

    if (win32StatPath(resolvedDevice).isUnc) {
      resolvedDevice = win32.normalizeUNCRoot(resolvedDevice);
    }
    resolvedTail = normalizeArray(resolvedTail.split(/[\\\/]+/), !resolvedAbsolute).join('\\');
    return (resolvedDevice + (resolvedAbsolute ? '\\' : '') + resolvedTail) || '.';
  },

  normalize(path) {
    const { device, isUnc, isAbsolute, tail } = win32StatPath(path);
    const trailingSlash = /[\\\/]$/.test(tail);
    let normalizedTail = normalizeArray(tail.split(/[\\\/]+/), !isAbsolute).join('\\');

    if (!normalizedTail && !isAbsolute) normalizedTail = '.';
    if (normalizedTail && trailingSlash) normalizedTail += '\\';
    if (isUnc) device = win32.normalizeUNCRoot(device);
    return device + (isAbsolute ? '\\' : '') + normalizedTail;
  },

  isAbsolute: path => win32StatPath(path).isAbsolute,

  join(...args) {
    const paths = args.filter(arg => {
      if (!isString(arg)) throw new TypeError('Arguments to path.join must be strings');
      return arg;
    });

    let joined = paths.join('\\');
    if (!/^[\\\/]{2}[^\\\/]/.test(paths[0])) {
      joined = joined.replace(/^[\\\/]{2,}/, '\\');
    }

    return win32.normalize(joined);
  },

  relative(from, to) {
    const [fromParts, toParts] = [win32.resolve(from).toLowerCase().split('\\'), win32.resolve(to).toLowerCase().split('\\')];
    const samePartsLength = fromParts.findIndex((part, i) => part !== toParts[i]);

    if (samePartsLength === 0) return to;

    const outputParts = Array(fromParts.length - samePartsLength).fill('..').concat(toParts.slice(samePartsLength));
    return outputParts.join('\\');
  },

  _makeLong(path) {
    if (!isString(path)) return path;
    const resolvedPath = win32.resolve(path);
    if (/^[a-zA-Z]\:\\/.test(resolvedPath)) return '\\\\?\\' + resolvedPath;
    if (/^\\\\[^?.]/.test(resolvedPath)) return '\\\\?\\UNC\\' + resolvedPath.substring(2);
    return path;
  },

  dirname(path) {
    const [root, dir] = win32.splitPath(path);
    if (!root && !dir) return '.';
    return root + (dir ? dir.slice(0, -1) : '');
  },

  basename(path, ext) {
    let f = win32.splitPath(path)[2];
    if (ext && f.endsWith(ext)) f = f.slice(0, -ext.length);
    return f;
  },

  extname(path) {
    return win32.splitPath(path)[3];
  },

  format({ root = '', dir, base = '' }) {
    if (!isString(root)) throw new TypeError("'pathObject.root' must be a string or undefined");
    const fullDir = dir ? (dir.endsWith(win32.sep) ? dir : dir + win32.sep) : '';
    return fullDir + base;
  },

  parse(pathString) {
    if (!isString(pathString)) throw new TypeError("Parameter 'pathString' must be a string");
    const [root, dir, base, ext] = win32.splitPath(pathString);
    return {
      root,
      dir: root + dir.slice(0, -1),
      base,
      ext,
      name: base.slice(0, -ext.length)
    };
  },

  sep: '\\',
  delimiter: ';',

  splitPath(filename) {
    return this.splitDeviceRe.exec(filename).slice(1);
  }
};

// Define POSIX-specific path utilities
const posix = {
  resolve(...args) {
    let resolvedPath = '', resolvedAbsolute = false;

    for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      const path = i >= 0 ? args[i] : process.cwd();
      if (isString(path) && path) {
        resolvedPath = path + '/' + resolvedPath;
        resolvedAbsolute = path[0] === '/';
      }
    }

    resolvedPath = normalizeArray(resolvedPath.split('/'), !resolvedAbsolute).join('/');
    return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
  },

  normalize(path) {
    const isAbsolute = this.isAbsolute(path);
    const trailingSlash = path && path[path.length - 1] === '/';

    path = normalizeArray(path.split('/'), !isAbsolute).join('/');
    if (!path && !isAbsolute) path = '.';
    if (path && trailingSlash) path += '/';
    return (isAbsolute ? '/' : '') + path;
  },

  isAbsolute: path => path.charAt(0) === '/',

  join(...args) {
    const paths = args.filter(segment => {
      if (!isString(segment)) throw new TypeError('Arguments to path.join must be strings');
      return segment;
    });

    return posix.normalize(paths.join('/'));
  },

  relative(from, to) {
    if (!isString(from) || !isString(to)) throw new TypeError('Path must be a string');

    [from, to] = [posix.resolve(from).substr(1), posix.resolve(to).substr(1)];
    const [fromParts, toParts] = [trimArray(from.split('/')), trimArray(to.split('/'))];

    const samePartsLength = fromParts.findIndex((part, i) => part !== toParts[i]);
    const outputParts = Array(fromParts.length - samePartsLength).fill('..').concat(toParts.slice(samePartsLength));
    return outputParts.join('/');
  },

  _makeLong: path => path,

  dirname(path) {
    const [root, dir] = posix.splitPath(path);
    return (!root && !dir ? '.' : root + (dir ? dir.slice(0, -1) : ''));
  },

  basename(path, ext) {
    let f = posix.splitPath(path)[2];
    if (ext && f.endsWith(ext)) f = f.slice(0, -ext.length);
    return f;
  },

  extname(path) {
    return posix.splitPath(path)[3];
  },

  format({ root = '', dir, base = '' }) {
    if (!isString(root)) throw new TypeError("'pathObject.root' must be a string or undefined");
    const fullDir = dir ? dir + posix.sep : '';
    return fullDir + base;
  },

  parse(pathString) {
    if (!isString(pathString)) throw new TypeError("Parameter 'pathString' must be a string");
    const [root, dir, base, ext] = posix.splitPath(pathString);
    return {
      root,
      dir: root + dir.slice(0, -1),
      base,
      ext,
      name: base.slice(0, -ext.length)
    };
  },

  sep: '/',
  delimiter: ':',

  splitPath(filename) {
    return splitPathRe.exec(filename).slice(1);
  }
};

// Path separator regex and utility functions
const splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;

// Export the appropriate platform-specific path utilities
module.exports = isWindows ? win32 : posix;
module.exports.posix = posix;
module.exports.win32 = win32;
