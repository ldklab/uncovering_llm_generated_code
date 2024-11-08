const fs = require('fs');
let core;

if (process.platform === 'win32' || global.TESTING_WINDOWS) {
  core = require('./windows.js');
} else {
  core = require('./mode.js');
}

module.exports = { isexe, sync };

function isexe(path, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (!cb) {
    if (typeof Promise !== 'function') {
      throw new TypeError('callback not provided');
    }

    return new Promise((resolve, reject) => {
      isexe(path, options || {}, (er, is) => {
        er ? reject(er) : resolve(is);
      });
    });
  }

  core(path, options || {}, (er, is) => {
    if (er && (er.code === 'EACCES' || (options && options.ignoreErrors))) {
      er = null;
      is = false;
    }
    cb(er, is);
  });
}

function sync(path, options) {
  try {
    return core.sync(path, options || {});
  } catch (er) {
    if (options && options.ignoreErrors || er.code === 'EACCES') {
      return false;
    }
    throw er;
  }
}
