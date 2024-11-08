const fs = require('fs');
const path = require('path');

function oldJavaScriptRealpath(p, options, callback) {
  // Simplistic placeholder for old JavaScript realpath function
  try {
    let resolvedPath = path.resolve(p);
    callback(null, resolvedPath); // assuming path.resolve mimics old behavior
  } catch (err) {
    callback(err);
  }
}

function realpath(p, callback) {
  fs.realpath(p, (err, resolvedPath) => {
    if (err && (err.code === 'ELOOP' || err.code === 'ENOMEM' || err.code === 'ENAMETOOLONG')) {
      // If we encounter one of the new errors, use the old JS implementation
      oldJavaScriptRealpath(p, {}, callback);
    } else {
      callback(err, resolvedPath);
    }
  });
}

function realpathSync(p) {
  try {
    return fs.realpathSync(p);
  } catch (err) {
    if (err.code === 'ELOOP' || err.code === 'ENOMEM' || err.code === 'ENAMETOOLONG') {
      // Fallback to JavaScript implementation
      return path.resolve(p); // assuming path.resolve mimics old behavior
    }
    throw err;
  }
}

let originalRealpath = fs.realpath;
let originalRealpathSync = fs.realpathSync;

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
