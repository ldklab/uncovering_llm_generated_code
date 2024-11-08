const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');

const writeFileAsync = promisify(fs.writeFile);
const renameAsync = promisify(fs.rename);
const unlinkAsync = promisify(fs.unlink);
const fdatasyncAsync = promisify(fs.fdatasync || fs.fsync);

function generateTempFilename(target) {
  const hash = crypto.createHash('md5');
  hash.update(`${target},${process.pid},${Date.now()}`);
  return `${target}.${hash.digest('hex')}`;
}

async function writeFileAtomic(filename, data, options = {}, callback) {
  const opts = {
    encoding: 'utf8',
    fsync: true,
    ...typeof options === 'string' ? { encoding: options } : options
  };

  const tmpFilename = generateTempFilename(filename);

  try {
    await writeFileAsync(tmpFilename, data, { encoding: opts.encoding, mode: opts.mode });

    if (opts.fsync) {
      const fd = fs.openSync(tmpFilename, 'r');
      await fdatasyncAsync(fd);
      fs.closeSync(fd);
    }

    if (opts.chown) {
      await promisify(fs.chown)(tmpFilename, opts.chown.uid, opts.chown.gid);
    }

    await renameAsync(tmpFilename, filename);
    if (callback) callback(null);
  } catch (error) {
    await unlinkAsync(tmpFilename).catch(() => {});
    if (callback) callback(error);
    else throw error;
  }
}

function writeFileAtomicSync(filename, data, options = {}) {
  const opts = {
    encoding: 'utf8',
    fsync: true,
    ...typeof options === 'string' ? { encoding: options } : options
  };

  const tmpFilename = generateTempFilename(filename);

  try {
    fs.writeFileSync(tmpFilename, data, { encoding: opts.encoding, mode: opts.mode });

    if (opts.fsync) {
      const fd = fs.openSync(tmpFilename, 'r');
      fs.fdatasyncSync ? fs.fdatasyncSync(fd) : fs.fsyncSync(fd);
      fs.closeSync(fd);
    }

    if (opts.chown) {
      fs.chownSync(tmpFilename, opts.chown.uid, opts.chown.gid);
    }

    fs.renameSync(tmpFilename, filename);
  } catch (error) {
    fs.unlinkSync(tmpFilename);
    throw error;
  }
}

module.exports = writeFileAtomic;
module.exports.sync = writeFileAtomicSync;
