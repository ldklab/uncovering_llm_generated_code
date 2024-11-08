const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);
const rename = promisify(fs.rename);
const chown = promisify(fs.chown);
const unlink = promisify(fs.unlink);
const fdatasync = promisify(fs.fdatasync || fs.fsync);

function generateTempFilename() {
  const hash = crypto.createHash('md5');
  const args = Array.from(arguments);
  hash.update(args.map(String).join(','));
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

  const tempFile = `${filename}.${generateTempFilename(filename, process.pid, Date.now())}`;
  
  try {
    await writeFile(tempFile, data, { encoding: opts.encoding, mode: opts.mode });

    if (typeof opts.tmpfileCreated === 'function') {
      opts.tmpfileCreated(tempFile);
    }

    if (opts.fsync) {
      const fd = fs.openSync(tempFile, 'r');
      await fdatasync(fd);
      fs.closeSync(fd);
    }

    if (opts.chown && (opts.chown.uid !== undefined && opts.chown.gid !== undefined)) {
      await chown(tempFile, opts.chown.uid, opts.chown.gid);
    }

    await rename(tempFile, filename);
  } catch (err) {
    await unlink(tempFile).catch(() => {}); 
    if (callback) return callback(err);
    throw err;
  }

  if (callback) callback(null);
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

  const tempFile = `${filename}.${generateTempFilename(filename, process.pid, Date.now())}`;

  try {
    fs.writeFileSync(tempFile, data, { encoding: opts.encoding, mode: opts.mode });

    if (opts.fsync) {
      const fd = fs.openSync(tempFile, 'r');
      fs.fdatasyncSync ? fs.fdatasyncSync(fd) : fs.fsyncSync(fd);
      fs.closeSync(fd);
    }

    if (opts.chown && (opts.chown.uid !== undefined && opts.chown.gid !== undefined)) {
      fs.chownSync(tempFile, opts.chown.uid, opts.chown.gid);
    }

    fs.renameSync(tempFile, filename);
  } catch (err) {
    fs.unlinkSync(tempFile);
    throw err;
  }
}

module.exports = writeFileAtomic;
module.exports.sync = writeFileAtomicSync;
