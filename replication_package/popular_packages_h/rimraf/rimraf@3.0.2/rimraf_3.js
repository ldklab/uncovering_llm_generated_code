const assert = require("assert");
const path = require("path");
const fs = require("fs");
let glob;

try {
  glob = require("glob");
} catch (_) {}

const defaultGlobOpts = { nosort: true, silent: true };
let timeout = 0;
const isWindows = process.platform === "win32";

const defaults = (options) => {
  ["unlink", "chmod", "stat", "lstat", "rmdir", "readdir"].forEach((method) => {
    options[method] = options[method] || fs[method];
    method = method + "Sync";
    options[method] = options[method] || fs[method];
  });
  options.maxBusyTries = options.maxBusyTries || 3;
  options.emfileWait = options.emfileWait || 1000;
  if (options.glob === false) options.disableGlob = true;
  if (options.disableGlob !== true && glob === undefined) {
    throw new Error("glob dependency not found, set `options.disableGlob = true` if intentional");
  }
  options.disableGlob = options.disableGlob || false;
  options.glob = options.glob || defaultGlobOpts;
};

const rimraf = (p, options, cb) => {
  if (typeof options === "function") {
    cb = options;
    options = {};
  }
  
  assert(p, "rimraf: missing path");
  assert.strictEqual(typeof p, "string", "rimraf: path should be a string");
  assert.strictEqual(typeof cb, "function", "rimraf: callback function required");
  assert(options, "rimraf: invalid options argument provided");
  assert.strictEqual(typeof options, "object", "rimraf: options should be object");

  defaults(options);

  let busyTries = 0;
  let errState = null;
  let n = 0;
  
  const next = (er) => {
    errState = errState || er;
    if (--n === 0) cb(errState);
  };

  const afterGlob = (er, results) => {
    if (er) return cb(er);

    n = results.length;
    if (n === 0) return cb();

    results.forEach((p) => {
      const CB = (er) => {
        if (er) {
          if ((["EBUSY", "ENOTEMPTY", "EPERM"].includes(er.code)) && busyTries < options.maxBusyTries) {
            busyTries++;
            return setTimeout(() => rimraf_(p, options, CB), busyTries * 100);
          }

          if (er.code === "EMFILE" && timeout < options.emfileWait) {
            return setTimeout(() => rimraf_(p, options, CB), timeout++);
          }

          if (er.code === "ENOENT") er = null;
        }

        timeout = 0;
        next(er);
      };
      rimraf_(p, options, CB);
    });
  };

  if (options.disableGlob || !glob.hasMagic(p)) return afterGlob(null, [p]);

  options.lstat(p, (er) => {
    if (!er) return afterGlob(null, [p]);
    glob(p, options.glob, afterGlob);
  });
};

const rimraf_ = (p, options, cb) => {
  assert(p);
  assert(options);
  assert.strictEqual(typeof cb, "function");

  options.lstat(p, (er, st) => {
    if (er && er.code === "ENOENT") return cb(null);

    if (er && er.code === "EPERM" && isWindows) return fixWinEPERM(p, options, er, cb);

    if (st && st.isDirectory()) return rmdir(p, options, er, cb);

    options.unlink(p, (er) => {
      if (er && er.code === "ENOENT") return cb(null);
      if (er && er.code === "EPERM") return isWindows ? fixWinEPERM(p, options, er, cb) : rmdir(p, options, er, cb);
      if (er && er.code === "EISDIR") return rmdir(p, options, er, cb);
      cb(er);
    });
  });
};

const fixWinEPERM = (p, options, er, cb) => {
  assert(p);
  assert(options);
  assert.strictEqual(typeof cb, "function");

  options.chmod(p, 0o666, (er2) => {
    if (er2) {
      cb(er2.code === "ENOENT" ? null : er);
    } else {
      options.stat(p, (er3, stats) => {
        if (er3) cb(er3.code === "ENOENT" ? null : er);
        else if (stats.isDirectory()) rmdir(p, options, er, cb);
        else options.unlink(p, cb);
      });
    }
  });
};

const fixWinEPERMSync = (p, options, er) => {
  assert(p);
  assert(options);

  try {
    options.chmodSync(p, 0o666);
  } catch (er2) {
    if (er2.code === "ENOENT") return;
    throw er;
  }

  let stats;
  try {
    stats = options.statSync(p);
  } catch (er3) {
    if (er3.code === "ENOENT") return;
    throw er;
  }

  if (stats.isDirectory()) rmdirSync(p, options, er);
  else options.unlinkSync(p);
};

const rmdir = (p, options, originalEr, cb) => {
  assert(p);
  assert(options);
  assert.strictEqual(typeof cb, "function");

  options.rmdir(p, (er) => {
    if (er && ["ENOTEMPTY", "EEXIST", "EPERM"].includes(er.code)) rmkids(p, options, cb);
    else if (er && er.code === "ENOTDIR") cb(originalEr);
    else cb(er);
  });
};

const rmkids = (p, options, cb) => {
  assert(p);
  assert(options);
  assert.strictEqual(typeof cb, "function");

  options.readdir(p, (er, files) => {
    if (er) return cb(er);

    let n = files.length;
    if (n === 0) return options.rmdir(p, cb);

    let errState;
    files.forEach((f) => {
      rimraf(path.join(p, f), options, (er) => {
        if (errState) return;
        if (er) return cb((errState = er));
        if (--n === 0) options.rmdir(p, cb);
      });
    });
  });
};

const rimrafSync = (p, options = {}) => {
  defaults(options);

  assert(p, "rimraf: missing path");
  assert.strictEqual(typeof p, "string", "rimraf: path should be a string");
  assert(options, "rimraf: missing options");
  assert.strictEqual(typeof options, "object", "rimraf: options should be object");

  let results = options.disableGlob || !glob.hasMagic(p) ? [p] : null;

  if (!results) {
    try {
      options.lstatSync(p);
      results = [p];
    } catch (er) {
      results = glob.sync(p, options.glob);
    }
  }

  if (!results.length) return;

  for (let p of results) {
    let st;
    try {
      st = options.lstatSync(p);
    } catch (er) {
      if (er.code === "ENOENT") return;
      if (er.code === "EPERM" && isWindows) fixWinEPERMSync(p, options, er);
    }

    try {
      if (st && st.isDirectory()) rmdirSync(p, options, null);
      else options.unlinkSync(p);
    } catch (er) {
      if (er.code === "ENOENT") return;
      if (er.code === "EPERM") return isWindows ? fixWinEPERMSync(p, options, er) : rmdirSync(p, options, er);
      if (er.code !== "EISDIR") throw er;

      rmdirSync(p, options, er);
    }
  }
};

const rmdirSync = (p, options, originalEr) => {
  assert(p);
  assert(options);

  try {
    options.rmdirSync(p);
  } catch (er) {
    if (er.code === "ENOENT") return;
    if (er.code === "ENOTDIR") throw originalEr;
    if (["ENOTEMPTY", "EEXIST", "EPERM"].includes(er.code)) rmkidsSync(p, options);
  }
};

const rmkidsSync = (p, options) => {
  assert(p);
  assert(options);

  options.readdirSync(p).forEach((f) => rimrafSync(path.join(p, f), options));

  const retries = isWindows ? 100 : 1;
  for (let i = 0; i < retries; i++) {
    try {
      options.rmdirSync(p);
      return;
    } catch {}
  }
};

module.exports = rimraf;
rimraf.sync = rimrafSync;