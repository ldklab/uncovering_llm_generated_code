const fs = require('fs');
let coreModule;

if (process.platform === 'win32' || global.TESTING_WINDOWS) {
  coreModule = require('./windows.js');
} else {
  coreModule = require('./mode.js');
}

module.exports = checkExecutable;
checkExecutable.sync = checkExecutableSync;

function checkExecutable(path, options = {}, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (!callback) {
    if (typeof Promise !== 'function') {
      throw new TypeError('callback not provided');
    }
    return new Promise((resolve, reject) => {
      checkExecutable(path, options, (error, isExecutable) => {
        if (error) {
          reject(error);
        } else {
          resolve(isExecutable);
        }
      });
    });
  }

  coreModule(path, options, (error, isExecutable) => {
    if (error) {
      if (error.code === 'EACCES' || options.ignoreErrors) {
        error = null;
        isExecutable = false;
      }
    }
    callback(error, isExecutable);
  });
}

function checkExecutableSync(path, options = {}) {
  try {
    return coreModule.sync(path, options);
  } catch (error) {
    if (options.ignoreErrors || error.code === 'EACCES') {
      return false;
    } else {
      throw error;
    }
  }
}
