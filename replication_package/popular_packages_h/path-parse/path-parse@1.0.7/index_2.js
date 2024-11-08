'use strict';

// Utility to determine if the current OS is Windows
var isWindows = process.platform === 'win32';

// Regex to split a Windows path into components: [dir, root, basename, name, ext]
var splitWindowsRe =
    /^(((?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?[\\\/]?)(?:[^\\\/]*[\\\/])*)((\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))[\\\/]*$/;

var win32 = {};

// Function to split Windows path using above regex
function win32SplitPath(filename) {
  return splitWindowsRe.exec(filename).slice(1);
}

// Function to parse a Windows path string into its components
win32.parse = function(pathString) {
  if (typeof pathString !== 'string') {
    throw new TypeError("Parameter 'pathString' must be a string, not " + typeof pathString);
  }
  var allParts = win32SplitPath(pathString);
  if (!allParts || allParts.length !== 5) {
    throw new TypeError("Invalid path '" + pathString + "'");
  }
  return {
    root: allParts[1],
    dir: allParts[0] === allParts[1] ? allParts[0] : allParts[0].slice(0, -1),
    base: allParts[2],
    ext: allParts[4],
    name: allParts[3]
  };
};

// Regex to split a POSIX path into components: [dir, root, basename, name, ext]
var splitPathRe = /^((\/?)(?:[^\/]*\/)*)((\.{1,2}|[^\/]+?|)(\.[^.\/]*|))[\/]*$/;
var posix = {};

// Function to split POSIX path using above regex
function posixSplitPath(filename) {
  return splitPathRe.exec(filename).slice(1);
}

// Function to parse a POSIX path string into its components
posix.parse = function(pathString) {
  if (typeof pathString !== 'string') {
    throw new TypeError("Parameter 'pathString' must be a string, not " + typeof pathString);
  }
  var allParts = posixSplitPath(pathString);
  if (!allParts || allParts.length !== 5) {
    throw new TypeError("Invalid path '" + pathString + "'");
  }
  
  return {
    root: allParts[1],
    dir: allParts[0].slice(0, -1),
    base: allParts[2],
    ext: allParts[4],
    name: allParts[3],
  };
};

// Export platform-specific parse function and both Windows and POSIX parse functions
if (isWindows)
  module.exports = win32.parse;
else 
  module.exports = posix.parse;

module.exports.posix = posix.parse;
module.exports.win32 = win32.parse;
