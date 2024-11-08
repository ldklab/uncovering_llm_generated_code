const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const RANDOM_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const DIR_MODE = 0o700;
const FILE_MODE = 0o600;

let _gracefulCleanup = false;
const _removeObjects = [];

function getRandomChars(howMany) {
  let value = [];
  let rnd = crypto.randomBytes(howMany);
  for (let i = 0; i < howMany; i++) {
    value.push(RANDOM_CHARS[rnd[i] % RANDOM_CHARS.length]);
  }
  return value.join('');
}

function tmpName(options, callback) {
  try {
    options = parseOptions(options);
    let name = generateTmpName(options);
    checkAndRetry(name, options.tries, callback);
  } catch (err) {
    callback(err);
  }
}

function tmpNameSync(options) {
  options = parseOptions(options);
  let tries = options.tries;
  while (tries--) {
    let name = generateTmpName(options);
    if (!fs.existsSync(name)) return name;
  }
  throw new Error('Could not generate a unique name');
}

function file(options, callback) {
  tmpName(options, (err, name) => {
    if (err) return callback(err);
    openFile(name, options, callback);
  });
}

function fileSync(options) {
  const name = tmpNameSync(options);
  const fd = fs.openSync(name, 'wx+', options.mode || FILE_MODE);
  return { name, fd, removeCallback: createRemoveCallback(name, fd, options) };
}

function dir(options, callback) {
  tmpName(options, (err, name) => {
    if (err) return callback(err);
    fs.mkdir(name, options.mode || DIR_MODE, (err) => {
      if (err) return callback(err);
      callback(null, name, createRemoveCallback(name, null, options, true));
    });
  });
}

function dirSync(options) {
  const name = tmpNameSync(options);
  fs.mkdirSync(name, options.mode || DIR_MODE);
  return { name, removeCallback: createRemoveCallback(name, null, options, true) };
}

function createRemoveCallback(name, fd, options, isDir = false) {
  return function () {
    if (fd !== null && fd >= 0) fs.closeSync(fd);
    if (isDir) fs.rmdirSync(name, { recursive: options.unsafeCleanup });
    else fs.unlinkSync(name);
    _removeObjects.splice(_removeObjects.indexOf(this), 1);
  };
}

function parseOptions(options) {
  return Object.assign({
    tries: 3,
    mode: FILE_MODE,
    tmpdir: os.tmpdir(),
    keep: false,
    prefix: 'tmp-',
    postfix: '',
    discardDescriptor: false
  }, options);
}

function generateTmpName(opts) {
  return path.join(opts.tmpdir, [
    opts.prefix,
    process.pid,
    getRandomChars(12),
    opts.postfix
  ].join(''));
}

function checkAndRetry(name, tries, callback) {
  fs.stat(name, (err) => {
    if (!err && tries > 0) {
      return checkAndRetry(generateTmpName(options), tries - 1, callback);
    }
    callback(err ? err : null, name);
  });
}

function setGracefulCleanup() {
  _gracefulCleanup = true;
}

process.on('exit', () => {
  if (_gracefulCleanup) {
    _removeObjects.forEach(fn => fn());
  }
});

module.exports = {
  tmpName,
  tmpNameSync,
  file,
  fileSync,
  dir,
  dirSync,
  setGracefulCleanup,
  get tmpdir() {
    return os.tmpdir();
  }
};
