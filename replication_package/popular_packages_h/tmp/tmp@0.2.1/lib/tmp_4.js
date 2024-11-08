const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const rimraf = require('rimraf');

const RANDOM_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const TEMPLATE_PATTERN = /XXXXXX/;
const DEFAULT_TRIES = 3;
const CREATE_FLAGS = fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_RDWR;
const DIR_MODE = 0o700;
const FILE_MODE = 0o600;
let _gracefulCleanup = false;
const _removeObjects = [];

function setGracefulCleanup() {
  _gracefulCleanup = true;
}

function tmpName(options, callback) {
  const opts = Object.assign({}, options);
  try {
    const name = generateTmpName(opts);
    fs.stat(name, (err) => err ? callback(null, name) : (opts.tries-- > 0 ? tmpName(opts, callback) : callback(new Error('Max tries reached'))));
  } catch (err) {
    callback(err);
  }
}

function tmpNameSync(options) {
  const opts = Object.assign({}, options);
  let name;
  do {
    name = generateTmpName(opts);
    if (!fs.existsSync(name)) return name;    
  } while (opts.tries-- > 0);
  throw new Error('Max tries reached');
}

function file(options, callback) {
  const opts = Object.assign({}, options);
  tmpName(opts, (err, name) => {
    if (err) return callback(err);
    fs.open(name, CREATE_FLAGS, opts.mode || FILE_MODE, (err, fd) => {
      if (err) return callback(err);
      callback(null, name, fd, prepareRemoveCallback(fd, name, opts, false));
    });
  });
}

function fileSync(options) {
  const opts = Object.assign({}, options);
  const name = tmpNameSync(opts);
  const fd = fs.openSync(name, CREATE_FLAGS, opts.mode || FILE_MODE);
  return { name, fd, removeCallback: prepareRemoveCallback(fd, name, opts, true) };
}

function dir(options, callback) {
  const opts = Object.assign({}, options);
  tmpName(opts, (err, name) => {
    if (err) return callback(err);
    fs.mkdir(name, opts.mode || DIR_MODE, (err) => {
      if (err) return callback(err);
      callback(null, name, prepareRemoveCallback(null, name, opts, false));
    });
  });
}

function dirSync(options) {
  const opts = Object.assign({}, options);
  const name = tmpNameSync(opts);
  fs.mkdirSync(name, opts.mode || DIR_MODE);
  return { name, removeCallback: prepareRemoveCallback(null, name, opts, true) };
}

function generateTmpName(opts) {
  const tmpdir = opts.tmpdir || os.tmpdir();
  if (opts.name) return path.join(tmpdir, opts.dir || '', opts.name);
  if (opts.template) return path.join(tmpdir, opts.dir || '', opts.template.replace(TEMPLATE_PATTERN, randomChars(6)));
  return path.join(tmpdir, opts.dir || '', 
    [opts.prefix || 'tmp', '-', process.pid, '-', randomChars(12), opts.postfix || ''].join('')
  );
}

function randomChars(howMany) {
  const value = new Array(howMany).fill().map(() => RANDOM_CHARS[crypto.randomBytes(1)[0] % RANDOM_CHARS.length]);
  return value.join('');
}

function prepareRemoveCallback(fd, name, opts, sync) {
  const removeCallback = () => {
    if (fd !== undefined && fd >= 0) fs.closeSync(fd);
    if (!opts.keep) fs.unlinkSync(name);
  };
  if (!opts.keep) _removeObjects.unshift(removeCallback);
  return removeCallback;
}

process.on('exit', () => {
  if (_gracefulCleanup) _removeObjects.forEach((fn) => { try { fn(); } catch (e) {} });
});

module.exports = {
  tmpName, tmpNameSync, file, fileSync, dir, dirSync, setGracefulCleanup,
  get tmpdir() { return os.tmpdir(); }
};
