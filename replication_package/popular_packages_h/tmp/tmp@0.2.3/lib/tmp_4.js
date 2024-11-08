const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const RANDOM_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const TEMPLATE_PATTERN = /XXXXXX/;
const DEFAULT_TRIES = 3;
const CREATE_FLAGS = fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_RDWR;

const IS_WIN32 = os.platform() === 'win32';
const DIR_MODE = 0o700;
const FILE_MODE = 0o600;

let _gracefulCleanup = false;
const _removeObjects = [];

function rimraf(dirPath, callback) {
  fs.rm(dirPath, { recursive: true }, callback);
}

function rimrafSync(dirPath) {
  fs.rmSync(dirPath, { recursive: true });
}

function tmpName(options, callback) {
  const opts = parseOptions(options, callback);
  if (!opts.valid) return callback(new Error('Invalid options'));
  let tries = opts.tries;

  (function tryGenerateName() {
    const name = generateTmpName(opts);
    fs.stat(name, (err) => {
      if (!err && tries-- > 0) return tryGenerateName();
      if (err) return callback(null, name);
      callback(new Error('Could not get a unique tmp filename'));
    });
  })();
}

function tmpNameSync(options) {
  const opts = parseOptions(options);
  if (!opts.valid) throw new Error('Invalid options');
  let tries = opts.tries;

  while (tries-- > 0) {
    const name = generateTmpName(opts);
    try {
      fs.statSync(name);
    } catch {
      return name;
    }
  }
  
  throw new Error('Could not get a unique tmp filename');
}

function file(options, callback) {
  const opts = parseOptions(options, callback);
  tmpName(opts, (err, name) => {
    if (err) return callback(err);

    fs.open(name, CREATE_FLAGS, opts.mode || FILE_MODE, (err, fd) => {
      if (err) return callback(err);
      if (opts.discardDescriptor) {
        fs.close(fd, () => callback(null, name, undefined, prepareRemoveCallback(name, -1, opts)));
      } else {
        callback(null, name, fd, prepareRemoveCallback(name, opts.detachDescriptor ? -1 : fd, opts));
      }
    });
  });
}

function fileSync(options) {
  const opts = parseOptions(options);
  const name = tmpNameSync(opts);
  let fd = fs.openSync(name, CREATE_FLAGS, opts.mode || FILE_MODE);
  if (opts.discardDescriptor) {
    fs.closeSync(fd);
    fd = undefined;
  }
  return { name, fd, removeCallback: prepareRemoveCallback(name, opts.detachDescriptor ? -1 : fd, opts, true) };
}

function dir(options, callback) {
  const opts = parseOptions(options, callback);
  tmpName(opts, (err, name) => {
    if (err) return callback(err);

    fs.mkdir(name, opts.mode || DIR_MODE, (err) => {
      if (err) return callback(err);
      callback(null, name, prepareRemoveCallback(name, opts));
    });
  });
}

function dirSync(options) {
  const opts = parseOptions(options);
  const name = tmpNameSync(opts);
  fs.mkdirSync(name, opts.mode || DIR_MODE);
  return { name, removeCallback: prepareRemoveCallback(name, opts, true) };
}

function prepareRemoveCallback(name, fd, opts, sync = false) {
  const removeSync = (path) => fs.unlinkSync(path);
  const removeAsync = (path, cb) => fs.unlink(path, cb);
  const method = opts.unsafeCleanup ? (sync ? rimrafSync : rimraf) : (sync ? removeSync : removeAsync);

  const removeCallback = () => {
    method(name, () => {});
    if (!opts.keep) {
      const idx = _removeObjects.indexOf(removeCallback);
      if (idx !== -1) _removeObjects.splice(idx, 1);
    }
  };

  if (!opts.keep) _removeObjects.push(removeCallback);
  return removeCallback;
}

function parseOptions(options, callback) {
  if (typeof options === 'function') return { tries: DEFAULT_TRIES, callback: options, valid: true };
  if (!options) return { tries: DEFAULT_TRIES, callback, valid: true };
  
  const tries = options.tries && Number.isInteger(options.tries) && options.tries > 0 ? options.tries : DEFAULT_TRIES;
  return { ...options, tries, callback, valid: true };
}

function generateTmpName(opts) {
  const tmpDir = opts.tmpdir || os.tmpdir();
  if (opts.name) return path.join(tmpDir, opts.dir || '', opts.name);
  if (opts.template) return path.join(tmpDir, opts.dir || '', opts.template.replace(TEMPLATE_PATTERN, randomChars(6)));

  return path.join(tmpDir, opts.dir || '', `tmp-${process.pid}-${randomChars(12)}${opts.postfix || ''}`);
}

function randomChars(howMany) {
  let rnd = crypto.randomBytes(howMany);
  return Array.from({ length: howMany }, (_, i) => RANDOM_CHARS[rnd[i] % RANDOM_CHARS.length]).join('');
}

function setGracefulCleanup() {
  _gracefulCleanup = true;
}

process.on('exit', () => {
  if (_gracefulCleanup) _removeObjects.forEach(fn => fn());
});

module.exports = {
  dir,
  dirSync,
  file,
  fileSync,
  tmpName,
  tmpNameSync,
  setGracefulCleanup,
  get tmpdir() { return os.tmpdir(); },
};
