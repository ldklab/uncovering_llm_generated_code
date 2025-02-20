const fs = require('fs');
const pathModule = require('./old.js');

const version = process.version;
const supportsModernRealpath = /^v[0-5]\./.test(version);

const originalRealpath = fs.realpath;
const originalRealpathSync = fs.realpathSync;

function isErrorRecoverable(error) {
  return error && error.syscall === 'realpath' &&
    ['ELOOP', 'ENOMEM', 'ENAMETOOLONG'].includes(error.code);
}

function realpath(p, cache, callback) {
  if (supportsModernRealpath) {
    return originalRealpath(p, cache, callback);
  }

  if (typeof cache === 'function') {
    callback = cache;
    cache = null;
  }

  originalRealpath(p, cache, (error, result) => {
    if (isErrorRecoverable(error)) {
      pathModule.realpath(p, cache, callback);
    } else {
      callback(error, result);
    }
  });
}

function realpathSync(p, cache) {
  if (supportsModernRealpath) {
    return originalRealpathSync(p, cache);
  }

  try {
    return originalRealpathSync(p, cache);
  } catch (error) {
    if (isErrorRecoverable(error)) {
      return pathModule.realpathSync(p, cache);
    } else {
      throw error;
    }
  }
}

function monkeypatch() {
  fs.realpath = realpath;
  fs.realpathSync = realpathSync;
}

function unmonkeypatch() {
  fs.realpath = originalRealpath;
  fs.realpathSync = originalRealpathSync;
}

module.exports = realpath;
realpath.realpath = realpath;
realpath.sync = realpathSync;
realpath.realpathSync = realpathSync;
realpath.monkeypatch = monkeypatch;
realpath.unmonkeypatch = unmonkeypatch;
