'use strict';

const isWindows = process.platform === 'win32';

const splitWindowsRe = /^(((?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?[\\\/]?)(?:[^\\\/]*[\\\/])*)((\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))[\\\/]*$/;

function win32SplitPath(filename) {
  return splitWindowsRe.exec(filename).slice(1);
}

function parseWindowsPath(pathString) {
  if (typeof pathString !== 'string') {
    throw new TypeError(`Parameter 'pathString' must be a string, not ${typeof pathString}`);
  }
  const allParts = win32SplitPath(pathString);
  if (!allParts || allParts.length !== 5) {
    throw new TypeError(`Invalid path '${pathString}'`);
  }
  return {
    root: allParts[1],
    dir: allParts[0] === allParts[1] ? allParts[0] : allParts[0].slice(0, -1),
    base: allParts[2],
    ext: allParts[4],
    name: allParts[3]
  };
}

const splitPathRe = /^((\/?)(?:[^\/]*\/)*)((\.{1,2}|[^\/]+?|)(\.[^.\/]*|))[\/]*$/;

function posixSplitPath(filename) {
  return splitPathRe.exec(filename).slice(1);
}

function parsePosixPath(pathString) {
  if (typeof pathString !== 'string') {
    throw new TypeError(`Parameter 'pathString' must be a string, not ${typeof pathString}`);
  }
  const allParts = posixSplitPath(pathString);
  if (!allParts || allParts.length !== 5) {
    throw new TypeError(`Invalid path '${pathString}'`);
  }
  return {
    root: allParts[1],
    dir: allParts[0].slice(0, -1),
    base: allParts[2],
    ext: allParts[4],
    name: allParts[3]
  };
}

const parse = isWindows ? parseWindowsPath : parsePosixPath;

module.exports = parse;
module.exports.posix = parsePosixPath;
module.exports.win32 = parseWindowsPath;
