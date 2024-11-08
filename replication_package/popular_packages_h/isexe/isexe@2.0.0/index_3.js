const fs = require('fs');
let core;

if (process.platform === 'win32' || global.TESTING_WINDOWS) {
  core = require('./windows.js');
} else {
  core = require('./mode.js');
}

module.exports = isExecutable;
isExecutable.sync = checkExecutableSync;

function isExecutable(path, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (!callback) {
    if (typeof Promise !== 'function') {
      throw new TypeError('callback not provided');
    }

    return new Promise((resolve, reject) => {
      isExecutable(path, options || {}, (error, isExec) => {
        if (error) {
          reject(error);
        } else {
          resolve(isExec);
        }
      });
    });
  }

  core(path, options || {}, (error, isExec) => {
    if (error && (error.code === 'EACCES' || (options && options.ignoreErrors))) {
      error = null;
      isExec = false;
    }
    callback(error, isExec);
  });
}

function checkExecutableSync(path, options) {
  try {
    return core.sync(path, options || {});
  } catch (error) {
    if ((options && options.ignoreErrors) || error.code === 'EACCES') {
      return false;
    } else {
      throw error;
    }
  }
}
