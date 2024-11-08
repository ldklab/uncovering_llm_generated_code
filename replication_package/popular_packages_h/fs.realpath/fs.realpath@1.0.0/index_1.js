const fs = require('fs');
const old = require('./old.js');
const originalRealpath = fs.realpath;
const originalRealpathSync = fs.realpathSync;
const version = process.version;
const isOldVersion = /^v[0-5]\./.test(version);

function handleRealpathError(err) {
  return err && err.syscall === 'realpath' && (
    err.code === 'ELOOP' ||
    err.code === 'ENOMEM' ||
    err.code === 'ENAMETOOLONG'
  );
}

function realpath(path, cache, callback) {
  if (isOldVersion) {
    return originalRealpath(path, cache, callback);
  }

  if (typeof cache === 'function') {
    callback = cache;
    cache = null;
  }

  originalRealpath(path, cache, (err, result) => {
    if (handleRealpathError(err)) {
      old.realpath(path, cache, callback);
    } else {
      callback(err, result);
    }
  });
}

function realpathSync(path, cache) {
  if (isOldVersion) {
    return originalRealpathSync(path, cache);
  }

  try {
    return originalRealpathSync(path, cache);
  } catch (err) {
    if (handleRealpathError(err)) {
      return old.realpathSync(path, cache);
    } else {
      throw err;
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

module.exports = {
  realpath,
  realpathSync,
  monkeypatch,
  unmonkeypatch
};
