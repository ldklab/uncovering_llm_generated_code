'use strict';

const util = require('util');

const isWindows = process.platform === 'win32';

function normalizeArray(parts, allowAboveRoot) {
  const res = [];
  for (const p of parts) {
    if (!p || p === '.') continue;
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
  return res;
}

function trimArray(arr) {
  let start = 0;
  for (; start < arr.length && !arr[start]; start++);
  let end = arr.length - 1;
  for (; end >= start && !arr[end]; end--);
  return start > end ? [] : arr.slice(start, end + 1);
}

function splitDeviceRe() {
  return /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;
}

function splitTailRe() {
  return /^([\s\S]*?)((?:\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))(?:[\\\/]*)$/;
}

function normalizeUNCRoot(device) {
  return '\\\\' + device.replace(/^[\\\/]+/, '').replace(/[\\\/]+/g, '\\');
}

const win32 = {
  resolve: function (...args) {
    let resolvedDevice = '', resolvedTail = '', resolvedAbsolute = false;

    for (let i = args.length - 1; i >= -1; i--) {
      const path = i >= 0 ? args[i] : (resolvedDevice ? process.env[`=${resolvedDevice}`] || `${resolvedDevice}\\` : process.cwd());
      
      if (!util.isString(path)) throw new TypeError('Arguments to path.resolve must be strings');
      if (!path) continue;

      const result = win32StatPath(path), device = result.device, isAbsolute = result.isAbsolute, tail = result.tail;
      if (device && resolvedDevice && device.toLowerCase() !== resolvedDevice.toLowerCase()) continue;

      if (!resolvedDevice) resolvedDevice = device;
      if (!resolvedAbsolute) {
        resolvedTail = tail + '\\' + resolvedTail;
        resolvedAbsolute = isAbsolute;
      }

      if (resolvedDevice && resolvedAbsolute) break;
    }

    if (win32StatPath(resolvedDevice).isUnc) {
      resolvedDevice = normalizeUNCRoot(resolvedDevice);
    }

    resolvedTail = normalizeArray(resolvedTail.split(/[\\\/]+/), !resolvedAbsolute).join('\\');

    return (resolvedDevice + (resolvedAbsolute ? '\\' : '') + resolvedTail) || '.';
  },

  normalize: function (path) {
    const result = win32StatPath(path);
    const tail = normalizeArray(result.tail.split(/[\\\/]+/), !result.isAbsolute).join('\\');
    if (result.isUnc) result.device = normalizeUNCRoot(result.device);
    return result.device + (result.isAbsolute ? '\\' : '') + (tail || (result.isAbsolute ? '' : '.'));
  },

  isAbsolute: function (path) {
    return win32StatPath(path).isAbsolute;
  },

  join: function (...args) {
    if (args.some(arg => !util.isString(arg))) throw new TypeError('Arguments to path.join must be strings');
    const joined = args.filter(arg => arg).join('\\');
    return win32.normalize(joined.replace(/^[\\\/]{2,}/, '\\'));
  },

  relative: function (from, to) {
    from = win32.resolve(from).toLowerCase();
    to = win32.resolve(to).toLowerCase();
    const lowerFromParts = trimArray(from.split('\\')), lowerToParts = trimArray(to.split('\\'));
    const outputParts = [];
    for (let samePartsLength = lowerFromParts.findIndex((p, i) => p !== lowerToParts[i]), i = samePartsLength; i < lowerFromParts.length; i++) {
      outputParts.push('..');
    }
    outputParts.push(...lowerToParts.slice(lowerFromParts.length - outputParts.length));
    return outputParts.join('\\');
  },

  _makeLong: function (path) {
    if (!util.isString(path)) return path;
    const resolvedPath = win32.resolve(path);
    return /^[a-zA-Z]:\\/.test(resolvedPath) ? '\\\\?\\' + resolvedPath : /^\\\\[^?.]/.test(resolvedPath) ? '\\\\?\\UNC\\' + resolvedPath.substring(2) : path;
  },

  dirname: function (path) {
    const result = win32SplitPath(path), root = result[0], dir = result[1];
    return !root && !dir ? '.' : root + (dir ? dir.slice(0, -1) : '');
  },

  basename: function (path, ext) {
    const f = win32SplitPath(path)[2];
    return ext && f.endsWith(ext) ? f.slice(0, -ext.length) : f;
  },

  extname: function (path) {
    return win32SplitPath(path)[3];
  },

  format: function (pathObject) {
    if (!util.isObject(pathObject)) throw new TypeError("Parameter 'pathObject' must be an object");
    const { root = '', dir, base = '' } = pathObject;
    if (!util.isString(root)) throw new TypeError("'pathObject.root' must be a string or undefined");
    return dir ? dir + (dir.endsWith(win32.sep) ? '' : win32.sep) + base : base;
  },

  parse: function (pathString) {
    if (!util.isString(pathString)) throw new TypeError("Parameter 'pathString' must be a string");
    const [root, dir, base, ext] = win32SplitPath(pathString);
    return { root, dir: root + dir.slice(0, -1), base, ext, name: base.slice(0, -ext.length) };
  },

  sep: '\\',
  delimiter: ';'
};

function win32SplitPath(filename) {
  const [device, slash, tail] = splitDeviceRe().exec(filename).slice(1);
  const [dir, basename, ext] = splitTailRe().exec(tail).slice(1);
  return [(device || '') + (slash || ''), dir, basename, ext];
}

function win32StatPath(path) {
  const [device] = splitDeviceRe().exec(path).slice(1);
  return { device: device || '', isUnc: !!device && device[1] !== ':', isAbsolute: device && (/^\\/.test(device) || device[1] !== ':') };
}

function posixSplitPath(filename) {
  return /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(filename).slice(1);
}

const posix = {
  resolve: function (...args) {
    let resolvedPath = '', resolvedAbsolute = false;
    for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      const path = i >= 0 ? args[i] : process.cwd();
      if (!util.isString(path)) throw new TypeError('Arguments to path.resolve must be strings');
      if (!path) continue;
      resolvedAbsolute = path[0] === '/';
      resolvedPath = path + '/' + resolvedPath;
    }
    return (resolvedAbsolute ? '/' : '') + normalizeArray(resolvedPath.split('/'), !resolvedAbsolute).join('/') || '.';
  },

  normalize: function (path) {
    const isAbsolute = posix.isAbsolute(path), trailingSlash = path.endsWith('/');
    path = normalizeArray(path.split('/'), !isAbsolute).join('/');
    return (isAbsolute ? '/' : '') + (path || '.') + (trailingSlash ? '/' : '');
  },

  isAbsolute: function (path) {
    return path.startsWith('/');
  },

  join: function (...args) {
    if (args.some(arg => !util.isString(arg))) throw new TypeError('Arguments to path.join must be strings');
    return posix.normalize(args.filter(Boolean).join('/'));
  },

  relative: function (from, to) {
    from = posix.resolve(from).slice(1);
    to = posix.resolve(to).slice(1);
    const fromParts = trimArray(from.split('/')), toParts = trimArray(to.split('/'));
    const samePartsLength = fromParts.findIndex((part, i) => part !== toParts[i]);
    const outputParts = Array.from({ length: fromParts.length - samePartsLength }, () => '..').concat(toParts.slice(samePartsLength));
    return outputParts.join('/');
  },

  _makeLong: function (path) {
    return path;
  },

  dirname: function (path) {
    const [root, dir] = posixSplitPath(path);
    return (!root && !dir) ? '.' : root + dir.slice(0, -1);
  },

  basename: function (path, ext) {
    const f = posixSplitPath(path)[2];
    return ext && f.endsWith(ext) ? f.slice(0, -ext.length) : f;
  },

  extname: function (path) {
    return posixSplitPath(path)[3];
  },

  format: function (pathObject) {
    if (!util.isObject(pathObject)) throw new TypeError("Parameter 'pathObject' must be an object");
    const { root = '', dir, base = '' } = pathObject;
    if (!util.isString(root)) throw new TypeError("'pathObject.root' must be a string or undefined");
    return (dir ? dir + posix.sep : '') + base;
  },

  parse: function (pathString) {
    if (!util.isString(pathString)) throw new TypeError("Parameter 'pathString' must be a string");
    const [root, dir, base, ext] = posixSplitPath(pathString);
    return { root, dir: root + dir.slice(0, -1), base, ext, name: base.slice(0, -ext.length) };
  },

  sep: '/',
  delimiter: ':'
};

module.exports = isWindows ? win32 : posix;
module.exports.posix = posix;
module.exports.win32 = win32;
