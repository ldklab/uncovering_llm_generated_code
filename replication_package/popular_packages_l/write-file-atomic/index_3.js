const fs = require('fs');
const crypto = require('crypto');
const { promisify } = require('util');

// Promisify commonly used fs functions
const writeFile = promisify(fs.writeFile);
const rename = promisify(fs.rename);
const chown = promisify(fs.chown);
const unlink = promisify(fs.unlink);
const syncMethod = promisify(fs.fdatasync || fs.fsync);

// Helper for generating unique temporary filenames
function generateTmpFileName(filename) {
  const hash = crypto.createHash('md5');
  hash.update([filename, process.pid, Date.now()].join(','));
  return `${filename}.${hash.digest('hex')}`;
}

// Asynchronous atomic write
async function atomicWriteFile(filename, data, options = {}, callback) {
  const opts = {
    encoding: 'utf8', 
    fsync: true,
    ...((typeof options === 'string') ? { encoding: options } : options)
  };

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  
  const tmpFilename = generateTmpFileName(filename);

  try {
    await writeFile(tmpFilename, data, { encoding: opts.encoding, mode: opts.mode });

    if (typeof opts.tmpfileCreated === 'function') opts.tmpfileCreated(tmpFilename);
    
    if (opts.fsync) {
      const fd = fs.openSync(tmpFilename, 'r');
      await syncMethod(fd);
      fs.closeSync(fd);
    }

    if (opts.chown?.uid && opts.chown?.gid) {
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

// Synchronous atomic write
function atomicWriteFileSync(filename, data, options = {}) {
  const opts = {
    encoding: 'utf8',
    fsync: true,
    ...(typeof options === 'string' ? { encoding: options } : options)
  };

  const tmpFilename = generateTmpFileName(filename);

  try {
    fs.writeFileSync(tmpFilename, data, { encoding: opts.encoding, mode: opts.mode });
    
    if (opts.fsync) {
      const fd = fs.openSync(tmpFilename, 'r');
      if (fs.fdatasyncSync) fs.fdatasyncSync(fd); else fs.fsyncSync(fd);
      fs.closeSync(fd);
    }
    
    if (opts.chown?.uid && opts.chown?.gid) {
      fs.chownSync(tmpFilename, opts.chown.uid, opts.chown.gid);
    }

    fs.renameSync(tmpFilename, filename);
  } catch (err) {
    try { fs.unlinkSync(tmpFilename); } catch {}
    throw err;
  }
}

module.exports = atomicWriteFile;
module.exports.sync = atomicWriteFileSync;
