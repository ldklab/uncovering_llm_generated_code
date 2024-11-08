const assert = require("assert");
const path = require("path");
const fs = require("fs");
let glob;
try {
  glob = require("glob");
} catch (_e) {}

const defaultGlobOpts = { nosort: true, silent: true };
let timeout = 0;
const isWindows = process.platform === "win32";

const setDefaults = opts => {
  const fsMethods = ['unlink', 'chmod', 'stat', 'lstat', 'rmdir', 'readdir'];
  fsMethods.forEach(method => {
    opts[method] = opts[method] || fs[method];
    opts[method + 'Sync'] = opts[method + 'Sync'] || fs[method + 'Sync'];
  });
  opts.maxBusyTries = opts.maxBusyTries || 3;
  opts.emfileWait = opts.emfileWait || 1000;
  opts.disableGlob = opts.glob === false || opts.disableGlob;
  opts.glob = opts.glob || defaultGlobOpts;
  if (!opts.disableGlob && glob === undefined) {
    throw new Error('glob dependency not found, set `options.disableGlob = true` if intentional');
  }
};

const rimraf = (p, opts, cb) => {
  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }
  assert(p, 'rimraf: missing path');
  assert.equal(typeof p, 'string', 'rimraf: path should be a string');
  assert.equal(typeof cb, 'function', 'rimraf: callback function required');
  assert(opts, 'rimraf: invalid options argument provided');
  assert.equal(typeof opts, 'object', 'rimraf: options should be object');
  setDefaults(opts);

  let busyTries = 0;
  let errState = null;
  let n = 0;
  const next = er => {
    errState = errState || er;
    if (--n === 0) cb(errState);
  };

  const processGlobResults = (er, results) => {
    if (er) return cb(er);
    n = results.length;
    if (n === 0) return cb();
    results.forEach(p => rimrafInternal(p, opts, next));
  };

  if (opts.disableGlob || !glob.hasMagic(p)) {
    return processGlobResults(null, [p]);
  }

  opts.lstat(p, (er, stat) => {
    if (!er) return processGlobResults(null, [p]);
    glob(p, opts.glob, processGlobResults);
  });
};

const rimrafInternal = (p, opts, cb) => {
  assert(p);
  assert(opts);
  assert(typeof cb === 'function');

  opts.lstat(p, (er, st) => {
    if (er && er.code === "ENOENT") return cb(null);
    if (er && er.code === "EPERM" && isWindows) return handleWinEPERM(p, opts, er, cb);

    if (st && st.isDirectory()) {
      return removeDir(p, opts, er, cb);
    }

    opts.unlink(p, er => {
      if (er && er.code === "ENOENT") return cb(null);
      if (er && er.code === "EPERM" && isWindows) return handleWinEPERM(p, opts, er, cb);
      if (er && er.code === "EISDIR") return removeDir(p, opts, er, cb);
      cb(er);
    });
  });
};

const handleWinEPERM = (p, opts, er, cb) => {
  assert(p);
  assert(opts);
  assert(typeof cb === 'function');

  opts.chmod(p, 0o666, er2 => {
    if (er2) return cb(er2.code === "ENOENT" ? null : er);
    opts.stat(p, (er3, stats) => {
      if (er3) return cb(er3.code === "ENOENT" ? null : er);
      if (stats.isDirectory()) return removeDir(p, opts, er, cb);
      opts.unlink(p, cb);
    });
  });
};

const removeDir = (p, opts, originalEr, cb) => {
  assert(p);
  assert(opts);
  assert(typeof cb === 'function');

  opts.rmdir(p, er => {
    if (er && (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM")) {
      emptyDirAndRemove(p, opts, cb);
    } else if (er && er.code === "ENOTDIR") {
      cb(originalEr);
    } else {
      cb(er);
    }
  });
};

const emptyDirAndRemove = (p, opts, cb) => {
  assert(p);
  assert(opts);
  assert(typeof cb === 'function');

  opts.readdir(p, (er, files) => {
    if (er) return cb(er);
    let n = files.length;
    if (n === 0) return opts.rmdir(p, cb);
    let errState;
    files.forEach(f => {
      rimraf(path.join(p, f), opts, er => {
        if (errState) return;
        if (er) return cb(errState = er);
        if (--n === 0) opts.rmdir(p, cb);
      });
    });
  });
};

const rimrafSync = (p, opts = {}) => {
  setDefaults(opts);
  assert(p, 'rimraf: missing path');
  assert.equal(typeof p, 'string', 'rimraf: path should be a string');
  assert(opts, 'rimraf: missing options');
  assert.equal(typeof opts, 'object', 'rimraf: options should be object');

  let results = opts.disableGlob || !glob.hasMagic(p) ? [p] : [];
  if (!results.length) try { opts.lstatSync(p); results = [p]; } catch (er) { results = glob.sync(p, opts.glob); }
  if (!results.length) return;

  results.forEach(p => {
    let st;
    try { st = opts.lstatSync(p); } catch (er) { 
      if (er.code === "ENOENT") return;
      if (er.code === "EPERM" && isWindows) handleSyncWinEPERM(p, opts, er);
    }

    try {
      if (st && st.isDirectory()) removeSyncDir(p, opts, null);
      else opts.unlinkSync(p);
    } catch (er) {
      if (er.code === "ENOENT") return;
      if (er.code === "EPERM") return isWindows ? handleSyncWinEPERM(p, opts, er) : removeSyncDir(p, opts, er);
      if (er.code !== "EISDIR") throw er;
      removeSyncDir(p, opts, er);
    }
  });
};

const handleSyncWinEPERM = (p, opts, er) => {
  assert(p);
  assert(opts);

  try { opts.chmodSync(p, 0o666); } catch (er2) { 
    if (er2.code === "ENOENT") return;
    else throw er; 
  }

  let stats;
  try { stats = opts.statSync(p); } catch (er3) { 
    if (er3.code === "ENOENT") return; 
    else throw er; 
  }

  if (stats.isDirectory()) removeSyncDir(p, opts, er);
  else opts.unlinkSync(p);
};

const removeSyncDir = (p, opts, originalEr) => {
  assert(p);
  assert(opts);

  try {
    opts.rmdirSync(p);
  } catch (er) {
    if (er.code === "ENOENT") return;
    if (er.code === "ENOTDIR") throw originalEr;
    if (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM") emptySyncDirAndRemove(p, opts);
  }
};

const emptySyncDirAndRemove = (p, opts) => {
  assert(p);
  assert(opts);
  opts.readdirSync(p).forEach(f => rimrafSync(path.join(p, f), opts));

  const retries = isWindows ? 100 : 1;
  let i = 0;
  do {
    let threw = true;
    try {
      const ret = opts.rmdirSync(p, opts);
      threw = false;
      return ret;
    } finally {
      if (++i < retries && threw) continue;
    }
  } while (true);
};

module.exports = rimraf;
rimraf.sync = rimrafSync;
