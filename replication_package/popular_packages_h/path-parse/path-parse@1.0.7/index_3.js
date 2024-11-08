'use strict';

const isWindows = process.platform === 'win32';

// Regular expression to parse Windows paths
const splitWindowsRe = /^(((?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?[\\\/]?)(?:[^\\\/]*[\\\/])*)((\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))[\\\/]*$/;

// Regular expression to parse POSIX paths
const splitPosixRe = /^((\/?)(?:[^\/]*\/)*)((\.{1,2}|[^\/]+?|)(\.[^.\/]*|))[\/]*$/;

function splitPath(re, filename) {
  return re.exec(filename).slice(1);
}

// Parsing functions for Windows and POSIX paths
function win32Parse(pathString) {
  return parsePath(pathString, splitWindowsRe);
}

function posixParse(pathString) {
  return parsePath(pathString, splitPosixRe);
}

function parsePath(pathString, regex) {
  if (typeof pathString !== 'string') {
    throw new TypeError(
      `Parameter 'pathString' must be a string, not ${typeof pathString}`
    );
  }
  const allParts = splitPath(regex, pathString);
  if (!allParts || allParts.length !== 5) {
    throw new TypeError(`Invalid path '${pathString}'`);
  }
  const [dir, root, base, name, ext] = allParts;
  return {
    root,
    dir: dir === root ? dir : dir.slice(0, -1),
    base,
    ext,
    name,
  };
}

// Determine which function to export by default
const defaultParse = isWindows ? win32Parse : posixParse;

// Expose functions
module.exports = defaultParse;
module.exports.win32 = win32Parse;
module.exports.posix = posixParse;
