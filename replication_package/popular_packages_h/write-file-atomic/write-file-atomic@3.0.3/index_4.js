'use strict';
const fs = require('fs');
const path = require('path');
const MurmurHash3 = require('imurmurhash');
const onExit = require('signal-exit');
const isTypedArray = require('is-typedarray');
const typedArrayToBuffer = require('typedarray-to-buffer');
const { promisify } = require('util');
const activeFiles = {};

// Get unique thread ID, fallback to 0 outside worker threads
const threadId = (() => {
  try {
    const { threadId } = require('worker_threads');
    return threadId;
  } catch (err) {
    return 0;
  }
})();

let invocations = 0;
function getTmpname(filename) {
  return filename + '.' + MurmurHash3(__filename)
    .hash(String(process.pid))
    .hash(String(threadId))
    .hash(String(++invocations))
    .result();
}

function cleanupOnExit(tmpfile) {
  return () => {
    try {
      fs.unlinkSync(typeof tmpfile === 'function' ? tmpfile() : tmpfile);
    } catch (_) {}
  };
}

function serializeActiveFile(absoluteName) {
  return new Promise(resolve => {
    if (!activeFiles[absoluteName]) activeFiles[absoluteName] = [];
    activeFiles[absoluteName].push(resolve);
    if (activeFiles[absoluteName].length === 1) resolve();
  });
}

function isChownErrOk(err) {
  if (err.code === 'ENOSYS') return true;
  const nonroot = !process.getuid || process.getuid() !== 0;
  return nonroot && (err.code === 'EINVAL' || err.code === 'EPERM');
}

async function writeFileAsync(filename, data, options = {}) {
  options = typeof options === 'string' ? { encoding: options } : options;
  let fd, tmpfile;
  const removeOnExitHandler = onExit(cleanupOnExit(() => tmpfile));
  const absoluteName = path.resolve(filename);

  try {
    await serializeActiveFile(absoluteName);
    const truename = await promisify(fs.realpath)(filename).catch(() => filename);
    tmpfile = getTmpname(truename);

    if (!options.mode || !options.chown) {
      const stats = await promisify(fs.stat)(truename).catch(() => {});
      if (stats) {
        options.mode ??= stats.mode;
        if (options.chown == null && process.getuid) {
          options.chown = { uid: stats.uid, gid: stats.gid };
        }
      }
    }

    fd = await promisify(fs.open)(tmpfile, 'w', options.mode);
    if (options.tmpfileCreated) await options.tmpfileCreated(tmpfile);

    data = isTypedArray(data) ? typedArrayToBuffer(data) : Buffer.isBuffer(data) ? data : Buffer.from(String(data), options.encoding || 'utf8');
    if (Buffer.isBuffer(data)) {
      await promisify(fs.write)(fd, data, 0, data.length, 0);
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
    } else delete activeFiles[absoluteName];
  }
}

function writeFile(filename, data, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  const promise = writeFileAsync(filename, data, options);
  if (callback) promise.then(callback, callback);
  return promise;
}

function writeFileSync(filename, data, options) {
  if (typeof options === 'string') options = { encoding: options };
  else if (!options) options = {};

  try {
    filename = fs.realpathSync(filename);
  } catch {}

  const tmpfile = getTmpname(filename);

  if (!options.mode || !options.chown) {
    try {
      const stats = fs.statSync(filename);
      options = { ...options, mode: options.mode ?? stats.mode, chown: options.chown ?? (process.getuid ? { uid: stats.uid, gid: stats.gid } : undefined) };
    } catch {}
  }

  let fd;
  const cleanup = cleanupOnExit(tmpfile);
  const removeOnExitHandler = onExit(cleanup);
  let threw = true;

  try {
    fd = fs.openSync(tmpfile, 'w', options.mode || 0o666);

    if (options.tmpfileCreated) options.tmpfileCreated(tmpfile);

    data = isTypedArray(data) ? typedArrayToBuffer(data) : Buffer.isBuffer(data) ? data : Buffer.from(String(data), options.encoding || 'utf8');
    if (Buffer.isBuffer(data)) {
      fs.writeSync(fd, data, 0, data.length, 0);
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
      } catch {}
    }
    removeOnExitHandler();
    if (threw) cleanup();
  }
}

module.exports = writeFile;
module.exports.sync = writeFileSync;
module.exports._getTmpname = getTmpname;
module.exports._cleanupOnExit = cleanupOnExit;
