'use strict';

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const MurmurHash3 = require('imurmurhash');
const { onExit } = require('signal-exit');

const activeFiles = {};

const threadId = (() => {
  try {
    const workerThreads = require('worker_threads');
    return workerThreads.threadId;
  } catch {
    return 0;
  }
})();

let invocations = 0;

function getTmpname(filename) {
  return filename + '.' +
    MurmurHash3(__filename)
      .hash(String(process.pid))
      .hash(String(threadId))
      .hash(String(++invocations))
      .result();
}

function cleanupOnExit(tmpfile) {
  return () => {
    try {
      fs.unlinkSync(typeof tmpfile === 'function' ? tmpfile() : tmpfile);
    } catch {
      // ignore
    }
  };
}

function serializeActiveFile(absoluteName) {
  return new Promise(resolve => {
    if (!activeFiles[absoluteName]) {
      activeFiles[absoluteName] = [];
    }
    activeFiles[absoluteName].push(resolve);
    if (activeFiles[absoluteName].length === 1) {
      resolve();
    }
  });
}

function isChownErrOk(err) {
  if (err.code === 'ENOSYS') return true;
  const nonroot = !process.getuid || process.getuid() !== 0;
  if (nonroot && (err.code === 'EINVAL' || err.code === 'EPERM')) {
    return true;
  }
  return false;
}

async function writeFileAsync(filename, data, options = {}) {
  if (typeof options === 'string') {
    options = { encoding: options };
  }

  let fd;
  let tmpfile;
  const removeOnExitHandler = onExit(cleanupOnExit(() => tmpfile));
  const absoluteName = path.resolve(filename);

  try {
    await serializeActiveFile(absoluteName);
    const truename = await promisify(fs.realpath)(filename).catch(() => filename);
    tmpfile = getTmpname(truename);

    if (!options.mode || !options.chown) {
      const stats = await promisify(fs.stat)(truename).catch(() => {});
      if (stats) {
        if (options.mode == null) options.mode = stats.mode;
        if (options.chown == null && process.getuid) {
          options.chown = { uid: stats.uid, gid: stats.gid };
        }
      }
    }

    fd = await promisify(fs.open)(tmpfile, 'w', options.mode);
    if (options.tmpfileCreated) await options.tmpfileCreated(tmpfile);
    if (ArrayBuffer.isView(data)) {
      await promisify(fs.write)(fd, data, 0, data.length, 0);
    } else if (data != null) {
      await promisify(fs.write)(fd, String(data), 0, String(options.encoding || 'utf8'));
    }

    if (options.fsync !== false) await promisify(fs.fsync)(fd);
    await promisify(fs.close)(fd);
    fd = null;

    if (options.chown) {
      await promisify(fs.chown)(tmpfile, options.chown.uid, options.chown.gid).catch(err => {
        if (!isChownErrOk(err)) throw err;
      });
    }

    if (options.mode) {
      await promisify(fs.chmod)(tmpfile, options.mode).catch(err => {
        if (!isChownErrOk(err)) throw err;
      });
    }

    await promisify(fs.rename)(tmpfile, truename);
  } finally {
    if (fd) await promisify(fs.close)(fd).catch(() => {});
    removeOnExitHandler();
    await promisify(fs.unlink)(tmpfile).catch(() => {});
    activeFiles[absoluteName].shift();
    if (activeFiles[absoluteName].length > 0) {
      activeFiles[absoluteName][0]();
    } else {
      delete activeFiles[absoluteName];
    }
  }
}

async function writeFile(filename, data, options, callback) {
  if (options instanceof Function) {
    callback = options;
    options = {};
  }

  const promise = writeFileAsync(filename, data, options);
  if (callback) {
    try {
      const result = await promise;
      return callback(null, result);
    } catch (err) {
      return callback(err);
    }
  }

  return promise;
}

function writeFileSync(filename, data, options) {
  if (typeof options === 'string') {
    options = { encoding: options };
  } else if (!options) {
    options = {};
  }

  try {
    filename = fs.realpathSync(filename);
  } catch {
    // it's ok
  }

  const tmpfile = getTmpname(filename);

  if (!options.mode || !options.chown) {
    try {
      const stats = fs.statSync(filename);
      options = Object.assign({}, options);
      if (!options.mode) options.mode = stats.mode;
      if (!options.chown && process.getuid) {
        options.chown = { uid: stats.uid, gid: stats.gid };
      }
    } catch {
      // ignore
    }
  }

  let fd;
  const cleanup = cleanupOnExit(tmpfile);
  const removeOnExitHandler = onExit(cleanup);

  let threw = true;
  try {
    fd = fs.openSync(tmpfile, 'w', options.mode || 0o666);
    if (options.tmpfileCreated) options.tmpfileCreated(tmpfile);
    if (ArrayBuffer.isView(data)) {
      fs.writeSync(fd, data, 0, data.length, 0);
    } else if (data != null) {
      fs.writeSync(fd, String(data), 0, String(options.encoding || 'utf8'));
    }
    if (options.fsync !== false) fs.fsyncSync(fd);
    fs.closeSync(fd);
    fd = null;

    if (options.chown) {
      try {
        fs.chownSync(tmpfile, options.chown.uid, options.chown.gid);
      } catch (err) {
        if (!isChownErrOk(err)) throw err;
      }
    }

    if (options.mode) {
      try {
        fs.chmodSync(tmpfile, options.mode);
      } catch (err) {
        if (!isChownErrOk(err)) throw err;
      }
    }

    fs.renameSync(tmpfile, filename);
    threw = false;
  } finally {
    if (fd) {
      try {
        fs.closeSync(fd);
      } catch {
        // ignore
      }
    }
    removeOnExitHandler();
    if (threw) cleanup();
  }
}

module.exports = writeFile;
module.exports.sync = writeFileSync;
module.exports._getTmpname = getTmpname;
module.exports._cleanupOnExit = cleanupOnExit;