// This module provides a custom implementation for the `realpath` and `realpathSync` functions, 
// overriding the default behavior in certain conditions based on the Node.js version.
// It aims to handle specific errors with a fallback to an older implementation for Node.js versions 0-5.

module.exports = realpath;
realpath.realpath = realpath;
realpath.sync = realpathSync;
realpath.realpathSync = realpathSync;
realpath.monkeypatch = monkeypatch;
realpath.unmonkeypatch = unmonkeypatch;

const fs = require('fs');
const origRealpath = fs.realpath;
const origRealpathSync = fs.realpathSync;

// Determine Node.js version compatibility
const version = process.version;
const isOldNodeVersion = /^v[0-5]\./.test(version);
const old = require('./old.js');

// Check for specific errors that might require a fallback to the old implementation
function isNewError(err) {
  return err && err.syscall === 'realpath' && (
    err.code === 'ELOOP' ||
    err.code === 'ENOMEM' ||
    err.code === 'ENAMETOOLONG'
  );
}

// Custom realpath implementation
function realpath(path, cache, callback) {
  if (isOldNodeVersion) {
    if (typeof cache === 'function') {
      callback = cache;
      cache = null;
    }
    origRealpath(path, cache, function (err, result) {
      if (isNewError(err)) {
        old.realpath(path, cache, callback);
      } else {
        callback(err, result);
      }
    });
  } else {
    return origRealpath(path, cache, callback);
  }
}

// Custom synchronous realpath implementation
function realpathSync(path, cache) {
  if (isOldNodeVersion) {
    try {
      return origRealpathSync(path, cache);
    } catch (err) {
      if (isNewError(err)) {
        return old.realpathSync(path, cache);
      } else {
        throw err;
      }
    }
  } else {
    return origRealpathSync(path, cache);
  }
}

// Monkeypatch the fs module to use the custom implementations
function monkeypatch() {
  fs.realpath = realpath;
  fs.realpathSync = realpathSync;
}

// Restore the original fs module functions
function unmonkeypatch() {
  fs.realpath = origRealpath;
  fs.realpathSync = origRealpathSync;
}
