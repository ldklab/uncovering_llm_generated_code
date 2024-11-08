const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);
const rename = promisify(fs.rename);
const stat = promisify(fs.stat);
const chmod = promisify(fs.chmod);
const chown = promisify(fs.chown);
const unlink = promisify(fs.unlink);
const fdatasync = promisify(fs.fdatasync || fs.fsync);

function murmurhex() {
  const hash = crypto.createHash('md5');
  const args = Array.prototype.slice.call(arguments);
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

  const tmpFilename = `${filename}.${murmurhex(filename, process.pid, new Date().getTime())}`;
  
  try {
    await writeFile(tmpFilename, data, { encoding: opts.encoding, mode: opts.mode });

    if (typeof opts.tmpfileCreated === 'function') {
      opts.tmpfileCreated(tmpFilename);
    }

    if (opts.fsync) {
      const fd = fs.openSync(tmpFilename, 'r');
      await fdatasync(fd);
      fs.close(fd, (err) => {
        if (err) throw err;
      });
    }

    if (opts.chown && (opts.chown.uid !== undefined && opts.chown.gid !== undefined)) {
      await chown(tmpFilename, opts.chown.uid, opts.chown.gid);
    }

    await rename(tmpFilename, filename);
  } catch (err) {
    await unlink(tmpFilename).catch(() => {}); 
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

  const tmpFilename = `${filename}.${murmurhex(filename, process.pid, new Date().getTime())}`;

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
