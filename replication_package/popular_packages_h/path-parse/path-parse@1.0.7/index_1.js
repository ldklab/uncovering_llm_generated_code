'use strict';

const platform = process.platform;
const isWindows = platform === 'win32';

// Regex to split a Windows path into [dir, root, basename, name, ext]
const splitWindowsRe =
  /^(((?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?[\\\/]?)(?:[^\\\/]*[\\\/])*)((\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))[\\\/]*$/;

// Regex to split a POSIX path into [dir, root, basename, name, ext]
const splitPosixRe =
  /^((\/?)(?:[^\/]*\/)*)((\.{1,2}|[^\/]+?|)(\.[^.\/]*|))[\/]*$/;

const parser = {
  win32: function(pathString) {
    validatePathString(pathString);
    const parts = splitPath(pathString, splitWindowsRe);
    return formatParts(parts);
  },
  posix: function(pathString) {
    validatePathString(pathString);
    const parts = splitPath(pathString, splitPosixRe);
    return formatParts(parts);
  }
};

function validatePathString(pathString) {
  if (typeof pathString !== 'string') {
    throw new TypeError(`Parameter 'pathString' must be a string, not ${typeof pathString}`);
  }
}

function splitPath(pathString, regex) {
  const parts = regex.exec(pathString);
  if (!parts || parts.length !== 6) {
    throw new TypeError(`Invalid path '${pathString}'`);
  }
  return parts.slice(1);
}

function formatParts(parts) {
  return {
    root: parts[1],
    dir: parts[0] === parts[1] ? parts[0] : parts[0].slice(0, -1),
    base: parts[2],
    ext: parts[4],
    name: parts[3]
  };
}

module.exports = isWindows ? parser.win32 : parser.posix;
module.exports.win32 = parser.win32;
module.exports.posix = parser.posix;
