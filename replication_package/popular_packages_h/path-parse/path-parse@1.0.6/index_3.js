'use strict';

const isWindows = process.platform === 'win32';

// Regex to split a windows path into its components.
const splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;
const splitTailRe = /^([\s\S]*?)((?:\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))(?:[\\\/]*)$/;

// Function to split a Windows filename.
function win32SplitPath(filename) {
  const result = splitDeviceRe.exec(filename);
  const device = (result[1] || '') + (result[2] || '');
  const tail = result[3] || '';
  const result2 = splitTailRe.exec(tail);
  const dir = result2[1];
  const basename = result2[2];
  const ext = result2[3];
  return [device, dir, basename, ext];
}

// Windows path parse function.
function parseWin32(pathString) {
  if (typeof pathString !== 'string') {
    throw new TypeError(`Parameter 'pathString' must be a string, not ${typeof pathString}`);
  }
  const [root, dir, base, ext] = win32SplitPath(pathString);
  if (!root && !dir && !base && !ext) {
    throw new TypeError(`Invalid path '${pathString}'`);
  }
  return {
    root,
    dir: root + dir.slice(0, -1),
    base,
    ext,
    name: base.slice(0, base.length - ext.length)
  };
}

// Regex to split a POSIX path into its components.
const splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;

// Function to split a POSIX filename.
function posixSplitPath(filename) {
  return splitPathRe.exec(filename).slice(1);
}

// POSIX path parse function.
function parsePosix(pathString) {
  if (typeof pathString !== 'string') {
    throw new TypeError(`Parameter 'pathString' must be a string, not ${typeof pathString}`);
  }
  const [root, dir, base, ext] = posixSplitPath(pathString);
  if (!root && !dir && !base && !ext) {
    throw new TypeError(`Invalid path '${pathString}'`);
  }
  return {
    root,
    dir: root + dir.slice(0, -1),
    base,
    ext,
    name: base.slice(0, base.length - ext.length)
  };
}

// Determine the default export based on the OS.
const parse = isWindows ? parseWin32 : parsePosix;

// Export the appropriate function depending on the current platform.
module.exports = parse;
module.exports.posix = parsePosix;
module.exports.win32 = parseWin32;
