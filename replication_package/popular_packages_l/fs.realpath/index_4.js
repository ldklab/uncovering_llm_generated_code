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

function enhancedRealpath(p, callback) {
  fs.realpath(p, (error, resolvedPath) => {
    if (error && ['ELOOP', 'ENOMEM', 'ENAMETOOLONG'].includes(error.code)) {
      legacyRealpath(p, callback);
    } else {
      callback(error, resolvedPath);
    }
  });
}

function enhancedRealpathSync(p) {
  try {
    return fs.realpathSync(p);
  } catch (error) {
    if (['ELOOP', 'ENOMEM', 'ENAMETOOLONG'].includes(error.code)) {
      return path.resolve(p);
    }
    throw error;
  }
}

const originalRealpath = fs.realpath;
const originalRealpathSync = fs.realpathSync;

function applyMonkeypatch() {
  fs.realpath = enhancedRealpath;
  fs.realpathSync = enhancedRealpathSync;
}

function removeMonkeypatch() {
  fs.realpath = originalRealpath;
  fs.realpathSync = originalRealpathSync;
}

module.exports = {
  enhancedRealpath,
  enhancedRealpathSync,
  applyMonkeypatch,
  removeMonkeypatch
};
