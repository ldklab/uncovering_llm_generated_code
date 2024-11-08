const fs = require('fs');
let coreModule;

// Determine the platform-specific module.
if (process.platform === 'win32' || global.TESTING_WINDOWS) {
  coreModule = require('./windows.js');
} else {
  coreModule = require('./mode.js');
}

module.exports = checkExecutable;
checkExecutable.sync = syncCheck;

/**
 * Asynchronous check if the file is executable.
 * @param {string} path - The file path to check.
 * @param {object|function} [options] - Options object or callback function.
 * @param {function} [cb] - Callback function if not using promises.
 * @returns {Promise|void} - Returns a promise if no callback is provided.
 */
function checkExecutable(path, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (!cb) {
    if (typeof Promise !== 'function') {
      throw new TypeError('callback not provided');
    }
    return new Promise((resolve, reject) => {
      checkExecutable(path, options || {}, (error, isExec) => {
        if (error) {
          reject(error);
        } else {
          resolve(isExec);
        }
      });
    });
  }

  coreModule(path, options || {}, (error, isExec) => {
    if (error) {
      if (error.code === 'EACCES' || (options && options.ignoreErrors)) {
        error = null;
        isExec = false;
      }
    }
    cb(error, isExec);
  });
}

/**
 * Synchronous check if the file is executable.
 * @param {string} path - The file path to check.
 * @param {object} [options] - Options object to determine behavior.
 * @returns {boolean} - Returns true if executable, otherwise false.
 */
function syncCheck(path, options) {
  try {
    return coreModule.sync(path, options || {});
  } catch (error) {
    if ((options && options.ignoreErrors) || error.code === 'EACCES') {
      return false;
    } else {
      throw error;
    }
  }
}
