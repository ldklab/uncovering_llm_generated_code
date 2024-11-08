const fs = require('fs');
const path = require('path');

function oldJavaScriptRealpath(p, callback) {
  try {
    const resolvedPath = path.resolve(p);
    callback(null, resolvedPath);
  } catch (err) {
    callback(err);
  }
}

function realpath(p, callback) {
  fs.realpath(p, (err, resolvedPath) => {
    if (err && ['ELOOP', 'ENOMEM', 'ENAMETOOLONG'].includes(err.code)) {
      oldJavaScriptRealpath(p, callback);
    } else {
      callback(err, resolvedPath);
    }
  });
}

function realpathSync(p) {
  try {
    return fs.realpathSync(p);
  } catch (err) {
    if (['ELOOP', 'ENOMEM', 'ENAMETOOLONG'].includes(err.code)) {
      return path.resolve(p);
    }
    throw err;
  }
}

const originalRealpath = fs.realpath;
const originalRealpathSync = fs.realpathSync;

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
