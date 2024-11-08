'use strict';

const fs = require('fs');
const path = require('path');
const MurmurHash3 = require('imurmurhash');
const onExit = require('signal-exit');
const { promisify } = require('util');
const isTypedArray = require('is-typedarray');
const typedArrayToBuffer = require('typedarray-to-buffer');

// Promisified fs functions
const realpath = promisify(fs.realpath);
const stat = promisify(fs.stat);
const open = promisify(fs.open);
const write = promisify(fs.write);
const fsync = promisify(fs.fsync);
const close = promisify(fs.close);
const rename = promisify(fs.rename);
const unlink = promisify(fs.unlink);
const chown = promisify(fs.chown);
const chmod = promisify(fs.chmod);

const activeFiles = {};

const threadId = (() => {
  try {
    const { threadId } = require('worker_threads');
    return threadId || 0;
  } catch {
    return 0;
  }
})();

let invocations = 0;

function getTmpname(filename) {
  const hash = MurmurHash3(__filename)
    .hash(String(process.pid))
    .hash(String(threadId))
    .hash(String(++invocations))
    .result();
  return `${filename}.${hash}`;
}

function cleanupOnExit(tmpfile) {
  return () => {
    try {
      fs.unlinkSync(typeof tmpfile === 'function' ? tmpfile() : tmpfile);
    } catch {}
  };
}

function serializeActiveFile(absoluteName) {
  if (!activeFiles[absoluteName]) activeFiles[absoluteName] = [];
  return new Promise((resolve) => {
    activeFiles[absoluteName].push(resolve);
    if (activeFiles[absoluteName].length === 1) resolve();
  });
}

function isChownErrOk(err) {
  const nonroot = !process.getuid || process.getuid() !== 0;
  return err.code === 'ENOSYS' || (nonroot && (err.code === 'EINVAL' || err.code === 'EPERM'));
}

async function writeFileAsync(filename, data, options = {}) {
  if (typeof options === 'string') options = { encoding: options };

  const absoluteName = path.resolve(filename);
  let fd;
  let tmpfile;
  const removeOnExitHandler = onExit(cleanupOnExit(() => tmpfile));

  try {
    await serializeActiveFile(absoluteName);

    const truename = await realpath(filename).catch(() => filename);
    tmpfile = getTmpname(truename);

    let { mode, chown, encoding, fsync = true, tmpfileCreated } = options;

    const stats = await stat(truename).catch(() => null);
    if (stats) {
      if (mode == null) mode = stats.mode;
      if (chown == null && process.getuid) {
        chown = { uid: stats.uid, gid: stats.gid };
      }
    }

    fd = await open(tmpfile, 'w', mode);

    if (tmpfileCreated) await tmpfileCreated(tmpfile);
    if (isTypedArray(data)) data = typedArrayToBuffer(data);

    if (Buffer.isBuffer(data)) {
      await write(fd, data, 0, data.length, 0);
    } else if (data != null) {
      await write(fd, String(data), 0, encoding || 'utf8');
    }

    if (fsync !== false) await fsync(fd);
    await close(fd);
    fd = null;

    if (chown) {
      await chown(tmpfile, chown.uid, chown.gid).catch((err) => {
        if (!isChownErrOk(err)) throw err;
      });
    }

    if (mode) {
      await chmod(tmpfile, mode).catch((err) => {
        if (!isChownErrOk(err)) throw err;
      });
    }

    await rename(tmpfile, truename);
  } finally {
    if (fd) await close(fd).catch(() => {});

    removeOnExitHandler();
    await unlink(tmpfile).catch(() => {});
    activeFiles[absoluteName].shift();
    if (activeFiles[absoluteName].length > 0) activeFiles[absoluteName][0]();
    else delete activeFiles[absoluteName];
  }
}

function writeFile(filename, data, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  const promise = writeFileAsync(filename, data, options);
  if (callback) promise.then(() => callback(null), callback);
  return promise;
}

function writeFileSync(filename, data, options = {}) {
  if (typeof options === 'string') options = { encoding: options };

  filename = fs.realpathSync(filename);
  const tmpfile = getTmpname(filename);

  let stats;
  try {
    stats = fs.statSync(filename);
  } catch {}

  options = { ...options };
  const { mode, chown, encoding = 'utf8', fsync = true, tmpfileCreated } = options;

  if (stats) {
    if (!mode) options.mode = stats.mode;
    if (!chown && process.getuid) {
      options.chown = { uid: stats.uid, gid: stats.gid };
    }
  }

  let fd;
  const cleanup = cleanupOnExit(tmpfile);
  const removeOnExitHandler = onExit(cleanup);

  try {
    fd = fs.openSync(tmpfile, 'w', mode || 0o666);
    if (tmpfileCreated) tmpfileCreated(tmpfile);

    if (isTypedArray(data)) data = typedArrayToBuffer(data);
    if (Buffer.isBuffer(data)) {
      fs.writeSync(fd, data, 0, data.length, 0);
    } else if (data) {
      fs.writeSync(fd, String(data), 0, encoding);
    }

    if (fsync) fs.fsyncSync(fd);
    fs.closeSync(fd);
    fd = null;

    if (chown) {
      try {
        fs.chownSync(tmpfile, chown.uid, chown.gid);
      } catch (err) {
        if (!isChownErrOk(err)) throw err;
      }
    }

    if (mode) {
      try {
        fs.chmodSync(tmpfile, mode);
      } catch (err) {
        if (!isChownErrOk(err)) throw err;
      }
    }

    fs.renameSync(tmpfile, filename);
  } finally {
    if (fd) {
      try {
        fs.closeSync(fd);
      } catch {}
    }
    removeOnExitHandler();
    cleanup();
  }
}

module.exports = writeFile;
module.exports.sync = writeFileSync;
module.exports._getTmpname = getTmpname; // for testing
module.exports._cleanupOnExit = cleanupOnExit;
