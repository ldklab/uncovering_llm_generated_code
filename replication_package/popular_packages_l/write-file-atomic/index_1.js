const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);
const rename = promisify(fs.rename);
const chown = promisify(fs.chown);
const unlink = promisify(fs.unlink);
const fdatasync = promisify(fs.fdatasync || fs.fsync);

function generateUniqueHash(filename, pid, timestamp) {
  const hash = crypto.createHash('md5');
  hash.update([filename, pid, timestamp].join(','));
  return hash.digest('hex');
}

async function writeFileAtomic(filename, data, options = {}, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  const opts = {
    encoding: 'utf8',
    fsync: true,
    ...options
  };

  if (typeof options === 'string') {
    opts.encoding = options;
  }

  const tmpFilename = `${filename}.${generateUniqueHash(filename, process.pid, new Date().getTime())}`;
  
  try {
    await writeFile(tmpFilename, data, { encoding: opts.encoding, mode: opts.mode });

    if (opts.fsync) {
      const fd = fs.openSync(tmpFilename, 'r');
      await fdatasync(fd);
      fs.closeSync(fd);
    }

    if (opts.chown && (opts.chown.uid !== undefined && opts.chown.gid !== undefined)) {
      await chown(tmpFilename, opts.chown.uid, opts.chown.gid);
    }

    await rename(tmpFilename, filename);
    if (callback) callback(null);
  } catch (err) {
    await unlink(tmpFilename).catch(() => {});
    if (callback) return callback(err);
    throw err;
  }
}

function writeFileAtomicSync(filename, data, options = {}) {
  const opts = {
    encoding: 'utf8',
    fsync: true,
    ...options
  };

  if (typeof options === 'string') {
    opts.encoding = options;
  }

  const tmpFilename = `${filename}.${generateUniqueHash(filename, process.pid, new Date().getTime())}`;

  try {
    fs.writeFileSync(tmpFilename, data, { encoding: opts.encoding, mode: opts.mode });

    if (opts.fsync) {
      const fd = fs.openSync(tmpFilename, 'r');
      fs.fdatasyncSync ? fs.fdatasyncSync(fd) : fs.fsyncSync(fd);
      fs.closeSync(fd);
    }

    if (opts.chown && (opts.chown.uid !== undefined && opts.chown.gid !== undefined)) {
      fs.chownSync(tmpFilename, opts.chown.uid, opts.chown.gid);
    }

    fs.renameSync(tmpFilename, filename);
  } catch (err) {
    fs.unlinkSync(tmpFilename);
    throw err;
  }
}

module.exports = writeFileAtomic;
module.exports.sync = writeFileAtomicSync;
