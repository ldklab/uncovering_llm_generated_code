'use strict';

const isWindows = process.platform === 'win32';
const util = require('util');

function normalizeArray(parts, allowAboveRoot) {
  const res = [];
  for (const p of parts) {
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
  const hasNonEmpty = el => !!el;
  const start = arr.findIndex(hasNonEmpty);
  const end = arr.length - [...arr].reverse().findIndex(hasNonEmpty);
  return arr.slice(start, end);
}

const splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;
const splitTailRe = /^([\s\S]*?)((?:\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))(?:[\\\/]*)$/;

const win32 = {};
function win32SplitPath(filename) {
  const [device, slash, tail] = splitDeviceRe.exec(filename).slice(1);
  const [dir, basename, ext] = splitTailRe.exec(tail).slice(1);
  return [(device || '') + (slash || ''), dir, basename, ext];
}

function win32StatPath(path) {
  const [device] = splitDeviceRe.exec(path);
  const isUnc = !!device && device[1] !== ':';
  const tail = splitDeviceRe.exec(path)[3];
  const isAbsolute = isUnc || !!splitDeviceRe.exec(path)[2];
  return { device, isUnc, isAbsolute, tail };
}

function normalizeUNCRoot(device) {
  return `\\\\${device.replace(/^[\\\/]+/, '').replace(/[\\\/]+/g, '\\')}`;
}

win32.resolve = function(...args) {
  let resolvedDevice = '', resolvedTail = '', resolvedAbsolute = false;
  for (let i = args.length - 1; i >= -1; i--) {
    let path = (i >= 0) ? args[i] : process.cwd();
    if (!util.isString(path)) {
      throw new TypeError('Arguments to path.resolve must be strings');
    }
    if (!path) continue;

    const { device, isUnc, isAbsolute, tail } = win32StatPath(path);

    if (device && resolvedDevice &&
        device.toLowerCase() !== resolvedDevice.toLowerCase()) {
      continue;
    }

    if (!resolvedDevice) resolvedDevice = device;
    if (!resolvedAbsolute) {
      resolvedTail = tail + '\\' + resolvedTail;
      resolvedAbsolute = isAbsolute;
    }

    if (resolvedDevice && resolvedAbsolute) break;
  }

  if (resolvedDevice && win32StatPath(resolvedDevice).isUnc) {
    resolvedDevice = normalizeUNCRoot(resolvedDevice);
  }
  
  resolvedTail = normalizeArray(resolvedTail.split(/[\\\/]+/), !resolvedAbsolute).join('\\');

  return `${resolvedDevice}${resolvedAbsolute ? '\\' : ''}${resolvedTail}` || '.';
};

win32.normalize = function(path) {
  const { device, isUnc, isAbsolute, tail } = win32StatPath(path);
  let normalizedTail = normalizeArray(tail.split(/[\\\/]+/), !isAbsolute).join('\\');
  if (!normalizedTail && !isAbsolute) normalizedTail = '.';
  if (isUnc) device = normalizeUNCRoot(device);
  return `${device}${isAbsolute ? '\\' : ''}${normalizedTail}`;
};

win32.isAbsolute = path => win32StatPath(path).isAbsolute;

win32.join = function(...args) {
  const paths = args.filter(arg => {
    if (!util.isString(arg)) {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return arg;
  }).join('\\').replace(/^[\\\/]{2,}/, '\\');
  
  return win32.normalize(paths);
};

win32.relative = function(from, to) {
  from = win32.resolve(from);
  to = win32.resolve(to);

  const lowerFromParts = trimArray(from.toLowerCase().split('\\'));
  const lowerToParts = trimArray(to.toLowerCase().split('\\'));

  const sharedLength = lowerFromParts.findIndex((val, i) => val !== lowerToParts[i]);
  
  const goUp = lowerFromParts.slice(sharedLength).fill('..');
  const goTo = trimArray(to.split('\\')).slice(sharedLength);
  
  return goUp.concat(goTo).join('\\');
};

win32._makeLong = function(path) {
  if (!util.isString(path)) return path;

  const resolvedPath = win32.resolve(path);
  if (/^[a-zA-Z]\:\\/.test(resolvedPath)) {
    return '\\\\?\\' + resolvedPath;
  } else if (/^\\\\[^?.]/.test(resolvedPath)) {
    return '\\\\?\\UNC\\' + resolvedPath.substring(2);
  }

  return path;
};

win32.dirname = function(path) {
  const [root, dir] = win32SplitPath(path);
  const handledDir = dir ? dir.slice(0, -1) : '';
  return `${root}${handledDir}`;
};

win32.basename = function(path, ext) {
  let basename = win32SplitPath(path)[2];
  if (ext && basename.endsWith(ext)) {
    basename = basename.slice(0, -ext.length);
  }
  return basename;
};

win32.extname = path => win32SplitPath(path)[3];

win32.format = function(pathObject) {
  if (!util.isObject(pathObject) || !util.isString(pathObject.root || '')) {
    throw new TypeError("Parameter 'pathObject' and its root must be an object and a string respectively");
  }

  const dir = pathObject.dir || '';
  const base = pathObject.base || '';
  return dir.endsWith(win32.sep) ? `${dir}${base}` : `${dir}${win32.sep}${base}`;
};

win32.parse = function(pathString) {
  if (!util.isString(pathString)) throw new TypeError("Parameter 'pathString' must be a string");

  const [root, dir, base, ext] = win32SplitPath(pathString);
  return {
    root, dir: root + dir.slice(0, -1), base, ext, name: base.slice(0, -ext.length),
  };
};

win32.sep = '\\';
win32.delimiter = ';';

const splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
const posix = {};

function posixSplitPath(filename) {
  return splitPathRe.exec(filename).slice(1);
}

posix.resolve = function(...args) {
  let resolvedPath = '';
  let resolvedAbsolute = false;
  for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    const path = (i >= 0) ? args[i] : process.cwd();
    if (!util.isString(path)) throw new TypeError('Arguments to path.resolve must be strings');
    if (!path) continue;

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path[0] === '/';
  }

  resolvedPath = normalizeArray(resolvedPath.split('/'), !resolvedAbsolute).join('/');

  return `${resolvedAbsolute ? '/' : ''}${resolvedPath}` || '.';
};

posix.normalize = function(path) {
  const isAbsolute = posix.isAbsolute(path);
  const trailingSlash = path.endsWith('/');

  path = normalizeArray(path.split('/'), !isAbsolute).join('/');

  if (!path && !isAbsolute) path = '.';
  if (path && trailingSlash) path += '/';

  return (isAbsolute ? '/' : '') + path;
};

posix.isAbsolute = path => path.startsWith('/');

posix.join = function(...args) {
  const path = args.filter(segment => {
    if (!util.isString(segment)) throw new TypeError('Arguments to path.join must be strings');
    return segment;
  }).join('/');

  return posix.normalize(path);
};

posix.relative = function(from, to) {
  from = posix.resolve(from).substr(1);
  to = posix.resolve(to).substr(1);

  const fromParts = trimArray(from.split('/'));
  const toParts = trimArray(to.split('/'));
  
  const samePartsLength = fromParts.findIndex((val, i) => val !== toParts[i]);

  const goUp = fromParts.slice(samePartsLength).fill('..');
  return [...goUp, ...toParts.slice(samePartsLength)].join('/');
};

posix._makeLong = path => path;

posix.dirname = function(path) {
  const [root, dir] = posixSplitPath(path);
  const handledDir = dir ? dir.slice(0, -1) : '';
  return `${root}${handledDir}`;
};

posix.basename = function(path, ext) {
  let basename = posixSplitPath(path)[2];
  if (ext && basename.endsWith(ext)) {
    basename = basename.slice(0, -ext.length);
  }
  return basename;
};

posix.extname = path => posixSplitPath(path)[3];

posix.format = function(pathObject) {
  if (!util.isObject(pathObject) || !util.isString(pathObject.root || '')) throw new TypeError("Parameter 'pathObject' and its root must be an object and a string respectively");

  const dir = pathObject.dir ? pathObject.dir + posix.sep : '';
  const base = pathObject.base || '';
  return dir + base;
};

posix.parse = function(pathString) {
  if (!util.isString(pathString)) throw new TypeError("Parameter 'pathString' must be a string");

  const [root, dir, base, ext] = posixSplitPath(pathString);
  return {
    root, dir: root + dir.slice(0, -1), base, ext, name: base.slice(0, -ext.length),
  };
};

posix.sep = '/';
posix.delimiter = ':';

module.exports = isWindows ? win32 : posix;
module.exports.posix = posix;
module.exports.win32 = win32;
