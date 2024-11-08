'use strict';
const util = require('util');
const isWindows = process.platform === 'win32';

function normalizeArray(parts, allowAboveRoot) {
  const res = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (!p || p === '.') continue;
    if (p === '..') {
      if (res.length && res[res.length - 1] !== '..') res.pop();
      else if (allowAboveRoot) res.push('..');
    } else {
      res.push(p);
    }
  }
  return res;
}

function trimArray(arr) {
  let start = 0, end = arr.length - 1;
  while (start <= end && !arr[start]) start++;
  while (end >= 0 && !arr[end]) end--;
  return arr.slice(start, end + 1);
}

function win32SplitPath(filename) {
  const result = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/.exec(filename);
  const [device, dir, basename, ext] = [...result, ''].slice(1, 5).concat(/^[\s\S]*?((?:\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))(?:[\\\/]*)$/.exec(result[3]) || []);
  return [device + (dir || ''), dir, basename, ext];
}

function win32StatPath(path) {
  const result = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/.exec(path);
  const [device, isUnc, isAbsolute, tail] = [(result[1] || ''), !!(result[1] && result[1][1] !== ':'), !!(result[2]), result[3]];
  return { device, isUnc, isAbsolute, tail };
}

function normalizeUNCRoot(device) {
  return '\\\\' + device.replace(/^[\\\/]+/, '').replace(/[\\\/]+/g, '\\');
}

const win32 = {
  resolve(...args) {
    let [resolvedDevice, resolvedTail, resolvedAbsolute] = ['', '', false];

    for (let i = args.length - 1; i >= -1; i--) {
      let path = i >= 0 ? args[i] : (!resolvedDevice ? process.cwd() : process.env['=' + resolvedDevice] || resolvedDevice + '\\');
      if (!util.isString(path)) throw new TypeError('Arguments to path.resolve must be strings');
      if (!path) continue;

      const result = win32StatPath(path);
      if (resolvedDevice && result.device.toLowerCase() !== resolvedDevice.toLowerCase()) continue;

      if (!resolvedDevice) resolvedDevice = result.device;
      if (!resolvedAbsolute) {
        resolvedTail = result.tail + '\\' + resolvedTail;
        resolvedAbsolute = result.isAbsolute;
      }

      if (resolvedDevice && resolvedAbsolute) break;
    }

    if (win32StatPath(resolvedDevice).isUnc) resolvedDevice = normalizeUNCRoot(resolvedDevice);
    resolvedTail = normalizeArray(resolvedTail.split(/[\\\/]+/), !resolvedAbsolute).join('\\');
    return (resolvedDevice + (resolvedAbsolute ? '\\' : '') + resolvedTail) || '.';
  },
  normalize(path) {
    const { device, isUnc, isAbsolute, tail } = win32StatPath(path);
    const trailingSlash = /[\\\/]$/.test(tail);
    const normalizedTail = normalizeArray(tail.split(/[\\\/]+/), !isAbsolute).join('\\') + (trailingSlash ? '\\' : '');
    return (isUnc ? normalizeUNCRoot(device) : device) + (isAbsolute ? '\\' : '') + normalizedTail || '.';
  },
  isAbsolute(path) {
    return win32StatPath(path).isAbsolute;
  },
  join(...args) {
    if (!args.every(util.isString)) throw new TypeError('Arguments to path.join must be strings');
    const joined = args.filter(Boolean).join('\\').replace(/^[\\\/]{2,}/, '\\');
    return win32.normalize(joined);
  },
  relative(from, to) {
    from = win32.resolve(from);
    to = win32.resolve(to);

    const fromParts = trimArray(from.toLowerCase().split('\\'));
    const toParts = trimArray(to.toLowerCase().split('\\'));
    let commonLength = Math.min(fromParts.length, toParts.length);

    for (let i = 0; i < commonLength; i++) {
      if (fromParts[i] !== toParts[i]) {
        commonLength = i;
        break;
      }
    }

    const outputParts = [...Array(fromParts.length - commonLength).fill('..')].concat(trimArray(to.split('\\')).slice(commonLength));
    return outputParts.join('\\');
  },
  _makeLong(path) {
    if (!util.isString(path)) return path;
    const resolvedPath = win32.resolve(path);
    return /^[a-zA-Z]\:\\/.test(resolvedPath) ? '\\\\?\\' + resolvedPath : (/^\\\\[^?.]/.test(resolvedPath) ? '\\\\?\\UNC\\' + resolvedPath.substring(2) : path);
  },
  dirname(path) {
    const [root, dir] = win32SplitPath(path);
    return !root && !dir ? '.' : root + dir.substr(0, dir.length - 1);
  },
  basename(path, ext) {
    let base = win32SplitPath(path)[2];
    return ext && base.endsWith(ext) ? base.slice(0, -ext.length) : base;
  },
  extname(path) {
    return win32SplitPath(path)[3];
  },
  format(pathObject) {
    if (!util.isObject(pathObject)) throw new TypeError("Parameter 'pathObject' must be an object, not " + typeof pathObject);
    const { root = '', dir, base = '' } = pathObject;
    return !util.isString(root) ? TypeError("'pathObject.root' must be a string or undefined, not " + typeof pathObject.root) : dir && dir.endsWith(win32.sep) ? dir + base : dir + win32.sep + base;
  },
  parse(pathString) {
    if (!util.isString(pathString)) throw new TypeError("Parameter 'pathString' must be a string, not " + typeof pathString);
    const [root, dir, base, ext] = win32SplitPath(pathString);
    const name = base.slice(0, base.length - ext.length);
    return { root, dir: root + dir.slice(0, -1), base, ext, name };
  }
};

win32.sep = '\\';
win32.delimiter = ';';

const posix = {
  resolve(...args) {
    return normalizeArray(args.reverse().reduce((joined, path) => {
      if (!util.isString(path)) throw new TypeError('Arguments to path.resolve must be strings');
      return path ? path + '/' + joined : joined;
    }, ''), path => path.charAt(0) === '/').join('/') || '.';
  },
  normalize(path) {
    const isAbsolute = posix.isAbsolute(path);
    const trailingSlash = path.endsWith('/');
    path = normalizeArray(path.split('/'), !isAbsolute).join('/') + (trailingSlash ? '/' : '');
    return (isAbsolute ? '/' : '') + (path || '.');
  },
  isAbsolute(path) {
    return path.startsWith('/');
  },
  join(...args) {
    return posix.normalize(args.filter(Boolean).join('/'));
  },
  relative(from, to) {
    from = posix.resolve(from).slice(1);
    to = posix.resolve(to).slice(1);
    const fromParts = trimArray(from.split('/'));
    const toParts = trimArray(to.split('/'));
    const commonLength = fromParts.reduce((count, part, index) => part !== toParts[index] ? count : index + 1, 0);
    const outputParts = [...Array(fromParts.length - commonLength).fill('..'), ...toParts.slice(commonLength)];
    return outputParts.join('/');
  },
  _makeLong: path => path,
  dirname(path) {
    const [root, dir] = splitPathRe.exec(path).slice(1, 3);
    return root || dir ? root + dir.slice(0, -1) : '.';
  },
  basename(path, ext) {
    const [_, __, basename] = splitPathRe.exec(path);
    return ext && basename.endsWith(ext) ? basename.slice(0, -ext.length) : basename;
  },
  extname(path) {
    return posixSplitPath(path)[3];
  },
  format(pathObject) {
    if (!util.isObject(pathObject)) throw new TypeError("Parameter 'pathObject' must be an object, not " + typeof pathObject);
    const { root = '', dir, base = '' } = pathObject;
    return dir && dir.endsWith(posix.sep) ? dir + base : dir + posix.sep + base;
  },
  parse(pathString) {
    if (!util.isString(pathString)) throw new TypeError("Parameter 'pathString' must be a string, not " + typeof pathString);
    const [root, dir, base, ext] = posixSplitPath(pathString).slice(0, 4);
    const name = base.slice(0, base.length - ext.length);
    return { root, dir: root + dir.slice(0, -1), base, ext, name };
  }
};

posix.sep = '/';
posix.delimiter = ':';

module.exports = isWindows ? win32 : posix;
module.exports.posix = posix;
module.exports.win32 = win32;
