const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const RANDOM_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const TEMPLATE_PATTERN = /XXXXXX/;
const DEFAULT_TRIES = 3;
const CREATE_FLAGS = fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_RDWR;
const DIR_MODE = 0o700;
const FILE_MODE = 0o600;

let _gracefulCleanup = false;
const _removeObjects = [];

/**
 * Generate random characters for temporary names.
 */
function _randomChars(howMany) {
  const rnd = crypto.randomBytes(howMany);
  let value = [];
  for (let i = 0; i < howMany; i++) {
    value.push(RANDOM_CHARS[rnd[i] % RANDOM_CHARS.length]);
  }
  return value.join('');
}

/**
 * Generate a temporary file name.
 */
function tmpName(options = {}, callback) {
  const opts = _sanitizeOptions(options);
  let tries = opts.tries || DEFAULT_TRIES;

  (function _getUniqueName() {
    const name = _generateTmpName(opts);
    fs.stat(name, (err) => {
      if (!err && tries-- > 0) return _getUniqueName();
      callback(err ? new Error(`Could not get a unique tmp filename, max tries reached ${name}`) : null, name);
    });
  })();
}

/**
 * Synchronously generate a temporary file name.
 */
function tmpNameSync(options = {}) {
  const opts = _sanitizeOptions(options);
  let tries = opts.tries || DEFAULT_TRIES;
  do {
    const name = _generateTmpName(opts);
    try {
      fs.statSync(name);
    } catch {
      return name;
    }
  } while (tries-- > 0);
  throw new Error('Could not get a unique tmp filename, max tries reached');
}

/**
 * Asserts and sanitizes options.
 */
function _sanitizeOptions(options) {
  const opts = { ...options };
  opts.tries = _isNumber(opts.tries) && opts.tries > 0 ? opts.tries : DEFAULT_TRIES;
  opts.tmpdir = opts.tmpdir || os.tmpdir();
  opts.keep = !!opts.keep;
  opts.prefix = opts.prefix || 'tmp';
  opts.postfix = opts.postfix || '';
  return opts;
}

/**
 * Generate a temporary name based on options.
 */
function _generateTmpName(opts) {
  const name = [opts.prefix, '-', process.pid, '-', _randomChars(12), opts.postfix].join('');
  return path.join(opts.tmpdir, opts.dir || '', opts.name || name);
}

function _isNumber(value) {
  return typeof value === 'number' && !isNaN(value);
}

module.exports = {
  tmpName,
  tmpNameSync,
};
