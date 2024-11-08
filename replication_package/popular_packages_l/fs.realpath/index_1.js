const fs = require('fs');
const path = require('path');

function legacyRealpath(p, callback) {
  try {
    const resolvedPath = path.resolve(p);
    callback(null, resolvedPath);
  } catch (error) {
    callback(error);
  }
}

function customRealpath(p, callback) {
  fs.realpath(p, (error, resolvedPath) => {
    if (error && ['ELOOP', 'ENOMEM', 'ENAMETOOLONG'].includes(error.code)) {
      legacyRealpath(p, callback);
    } else {
      callback(error, resolvedPath);
    }
  });
}

function customRealpathSync(p) {
  try {
    return fs.realpathSync(p);
  } catch (error) {
    if (['ELOOP', 'ENOMEM', 'ENAMETOOLONG'].includes(error.code)) {
      return path.resolve(p);
    }
    throw error;
  }
}

const originalFsRealpath = fs.realpath;
const originalFsRealpathSync = fs.realpathSync;

function applyMonkeyPatch() {
  fs.realpath = customRealpath;
  fs.realpathSync = customRealpathSync;
}

function removeMonkeyPatch() {
  fs.realpath = originalFsRealpath;
  fs.realpathSync = originalFsRealpathSync;
}

module.exports = {
  realpath: customRealpath,
  realpathSync: customRealpathSync,
  monkeypatch: applyMonkeyPatch,
  unmonkeypatch: removeMonkeyPatch
};
