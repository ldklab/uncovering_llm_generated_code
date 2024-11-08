const assert = require("assert");
const path = require("path");
const fs = require("fs");

let glob;
try {
  glob = require("glob");
} catch {
  // Optional dependency
}

const defaultGlobOpts = { nosort: true, silent: true };
let timeout = 0;
const isWindows = process.platform === "win32";

function defaults(options) {
  const fsMethods = ['unlink', 'chmod', 'stat', 'lstat', 'rmdir', 'readdir'];
  fsMethods.forEach(method => {
    options[method] = options[method] || fs[method];
    options[method + 'Sync'] = options[method + 'Sync'] || fs[method + 'Sync'];
  });
  options.maxBusyTries = options.maxBusyTries || 3;
  options.emfileWait = options.emfileWait || 1000;
  if (options.glob === false) options.disableGlob = true;
  if (!options.disableGlob && glob === undefined) {
    throw new Error('Missing glob dependency. Set `options.disableGlob = true` to proceed without it.');
  }
  options.disableGlob = options.disableGlob || false;
  options.glob = options.glob || defaultGlobOpts;
}

function rimraf(p, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  assert(p, 'Path required');
  assert.equal(typeof p, 'string', 'Path should be a string');
  assert.equal(typeof callback, 'function', 'Callback function required');
  assert.equal(typeof options, 'object', 'Options should be an object');
  defaults(options);

  let busyTries = 0;
  let errState = null;
  let operations = 0;

  const endCallback = (err) => {
    errState = errState || err;
    if (--operations === 0) callback(errState);
  };

  const processResults = (err, results) => {
    if (err) return callback(err);

    operations = results.length;
    if (operations === 0) return callback();

    results.forEach(filePath => {
      rimrafFile(filePath, options, (err) => {
        handleErrors(err, filePath);
        if (!err) {
          timeout = 0; // Reset timeout if successful
        }
        endCallback(err);
      });
    });
  };

  const handleErrors = (err, filePath) => {
    if (!err) return;

    if ((["EBUSY", "ENOTEMPTY", "EPERM"].includes(err.code)) && busyTries < options.maxBusyTries) {
      busyTries++;
      return setTimeout(() => rimrafFile(filePath, options, handleErrors), busyTries * 100);
    }

    if (err.code === "EMFILE" && timeout < options.emfileWait) {
      return setTimeout(() => rimrafFile(filePath, options, handleErrors), timeout++);
    }

    if (err.code === "ENOENT") err = null;
  };

  if (options.disableGlob || !glob.hasMagic(p)) {
    processResults(null, [p]);
  } else {
    options.lstat(p, (err) => {
      if (!err) return processResults(null, [p]);
      glob(p, options.glob, processResults);
    });
  }
}

function rimrafFile(filePath, options, callback) {
  assert(filePath, 'Path required');
  assert(typeof callback === 'function', 'Callback function required');

  options.lstat(filePath, (err, stats) => {
    if (err || (isWindows && err.code === "EPERM")) {
      adjustPermissions(filePath, options, err, callback, true);
      return;
    }
    
    if (stats && stats.isDirectory()) {
      removeDir(filePath, options, err, callback);
    } else {
      options.unlink(filePath, err => {
        if (err && ["ENOENT", "EPERM", "EISDIR"].includes(err.code)) {
          adjustPermissions(filePath, options, err, callback, false);
        } else {
          callback(err);
        }
      });
    }
  });
}

function adjustPermissions(filePath, options, err, callback, isStatError) {
  if (isStatError && err && err.code === "ENOENT") {
    return callback(null);
  }
  
  options.chmod(filePath, 0o666, error => {
    if (error) {
      callback(error.code === "ENOENT" ? null : err);
    } else {
      options.stat(filePath, (statErr, stats) => {
        if (statErr) {
          callback(statErr.code === "ENOENT" ? null : err);
        } else if (stats.isDirectory()) {
          removeDir(filePath, options, err, callback);
        } else {
          options.unlink(filePath, callback);
        }
      });
    }
  });
}

function removeDir(filePath, options, originalErr, callback) {
  assert(typeof callback === 'function', 'Callback function required');
  
  options.rmdir(filePath, err => {
    if (err && ["ENOTEMPTY", "EEXIST", "EPERM"].includes(err.code)) {
      removeChildren(filePath, options, callback);
    } else if (err && err.code === "ENOTDIR") {
      callback(originalErr);
    } else {
      callback(err);
    }
  });
}

function removeChildren(filePath, options, callback) {
  options.readdir(filePath, (err, files) => {
    if (err) return callback(err);
    let remaining = files.length;
    if (remaining === 0) return options.rmdir(filePath, callback);
    
    files.forEach(file => {
      rimraf(path.join(filePath, file), options, err => {
        if (err) return callback(err);
        if (--remaining === 0) options.rmdir(filePath, callback);
      });
    });
  });
}

function rimrafSync(filePath, options) {
  options = options || {};
  defaults(options);

  assert(filePath, 'Path required');
  assert.equal(typeof filePath, 'string', 'Path should be a string');
  assert.equal(typeof options, 'object', 'Options should be an object');

  let results;
  try {
    results = options.disableGlob || !glob.hasMagic(filePath) ? [filePath] : glob.sync(filePath, options.glob);
  } catch {
    return;
  }

  if (!results.length) return;

  results.forEach(p => {
    try {
      const stats = options.lstatSync(p);
      if (stats.isDirectory()) {
        removeDirSync(p, options);
      } else {
        options.unlinkSync(p);
      }
    } catch (err) {
      handleSyncErrors(p, options, err);
    }
  });
}

function handleSyncErrors(filePath, options, err) {
  if (err.code === "ENOENT") {
    return;
  }
  if (err.code === "EPERM") {
    adjustSyncPermissions(filePath, options, err);
  }
  if (err.code === "EISDIR") {
    removeDirSync(filePath, options);
  } else {
    throw err;
  }
}

function adjustSyncPermissions(filePath, options, err) {
  try {
    options.chmodSync(filePath, 0o666);
  } catch (chmodErr) {
    if (chmodErr.code === "ENOENT") return;
    throw err;
  }

  try {
    const stats = options.statSync(filePath);
    if (stats.isDirectory()) {
      removeDirSync(filePath, options);
    } else {
      options.unlinkSync(filePath);
    }
  } catch (statErr) {
    if (statErr.code === "ENOENT") return;
    throw err;
  }
}

function removeDirSync(filePath, options) {
  try {
    options.rmdirSync(filePath);
  } catch (err) {
    if (err.code === "ENOENT") return;
    if (err.code === "ENOTDIR") throw err;
    if (["ENOTEMPTY", "EEXIST", "EPERM"].includes(err.code)) {
      removeChildrenSync(filePath, options);
    }
  }
}

function removeChildrenSync(filePath, options) {
  try {
    const files = options.readdirSync(filePath);
    files.forEach(file => rimrafSync(path.join(filePath, file), options));
    options.rmdirSync(filePath);
  } catch (err) {
    if (err.code !== "ENOTEMPTY" && err.code !== "EEXIST") throw err;
  }
}

module.exports = rimraf;
rimraf.sync = rimrafSync;
