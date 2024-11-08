const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const rimraf = require('rimraf');

const RANDOM_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const TEMPLATE_PATTERN = /XXXXXX/;
const DEFAULT_TRIES = 3;

const CREATE_FLAGS = fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_RDWR;

const IS_WIN32 = os.platform() === 'win32';
const EBADF = os.constants.errno.EBADF;
const ENOENT = os.constants.errno.ENOENT;

const DIR_MODE = 0o700;
const FILE_MODE = 0o600;

const _removeObjects = [];
let _gracefulCleanup = false;

function tmpName(options, callback) {
  const args = _parseArguments(options, callback);
  const opts = args[0];
  const cb = args[1];

  try {
    _assertAndSanitizeOptions(opts);
  } catch (err) {
    return cb(err);
  }

  let tries = opts.tries;
  (function getUniqueName() {
    try {
      const name = _generateTmpName(opts);

      fs.stat(name, function (err) {
        if (!err) {
          if (tries-- > 0) return getUniqueName();

          return cb(new Error('Could not get a unique tmp filename, max tries reached ' + name));
        }

        cb(null, name);
      });
    } catch (err) {
      cb(err);
    }
  }());
}

function tmpNameSync(options) {
  const args = _parseArguments(options);
  const opts = args[0];

  _assertAndSanitizeOptions(opts);

  let tries = opts.tries;
  do {
    const name = _generateTmpName(opts);
    try {
      fs.statSync(name);
    } catch (e) {
      return name;
    }
  } while (tries-- > 0);

  throw new Error('Could not get a unique tmp filename, max tries reached');
}

function file(options, callback) {
  const args = _parseArguments(options, callback);
  const opts = args[0];
  const cb = args[1];

  tmpName(opts, function nameCreated(err, name) {
    if (err) return cb(err);

    fs.open(name, CREATE_FLAGS, opts.mode || FILE_MODE, function fileCreated(err, fd) {
      if (err) return cb(err);

      if (opts.discardDescriptor) {
        return fs.close(fd, function discardCallback(possibleErr) {
          return cb(possibleErr, name, undefined, _prepareTmpFileRemoveCallback(name, -1, opts, false));
        });
      } else {
        const discardOrDetachDescriptor = opts.discardDescriptor || opts.detachDescriptor;
        cb(null, name, fd, _prepareTmpFileRemoveCallback(name, discardOrDetachDescriptor ? -1 : fd, opts, false));
      }
    });
  });
}

function fileSync(options) {
  const args = _parseArguments(options);
  const opts = args[0];

  const discardOrDetachDescriptor = opts.discardDescriptor || opts.detachDescriptor;
  const name = tmpNameSync(opts);
  let fd = fs.openSync(name, CREATE_FLAGS, opts.mode || FILE_MODE);
  if (opts.discardDescriptor) {
    fs.closeSync(fd);
    fd = undefined;
  }

  return {
    name: name,
    fd: fd,
    removeCallback: _prepareTmpFileRemoveCallback(name, discardOrDetachDescriptor ? -1 : fd, opts, true)
  };
}

function dir(options, callback) {
  const args = _parseArguments(options, callback);
  const opts = args[0];
  const cb = args[1];

  tmpName(opts, function nameCreated(err, name) {
    if (err) return cb(err);

    fs.mkdir(name, opts.mode || DIR_MODE, function dirCreated(err) {
      if (err) return cb(err);

      cb(null, name, _prepareTmpDirRemoveCallback(name, opts, false));
    });
  });
}

function dirSync(options) {
  const args = _parseArguments(options);
  const opts = args[0];

  const name = tmpNameSync(opts);
  fs.mkdirSync(name, opts.mode || DIR_MODE);

  return {
    name: name,
    removeCallback: _prepareTmpDirRemoveCallback(name, opts, true)
  };
}

function _removeFileAsync(fdPath, next) {
  const handler = function (err) {
    if (err && !_isENOENT(err)) {
      return next(err);
    }
    next();
  };

  if (fdPath[0] >= 0)
    fs.close(fdPath[0], function () {
      fs.unlink(fdPath[1], handler);
    });
  else fs.unlink(fdPath[1], handler);
}

function _removeFileSync(fdPath) {
  try {
    if (fdPath[0] >= 0) fs.closeSync(fdPath[0]);
  } catch (e) {
    if (!_isEBADF(e) && !_isENOENT(e)) throw e;
  }

  try {
    fs.unlinkSync(fdPath[1]);
  } catch (e) {
    if (!_isENOENT(e)) throw e;
  }
}

function _prepareTmpFileRemoveCallback(name, fd, opts, sync) {
  const removeCallbackSync = _prepareRemoveCallback(_removeFileSync, [fd, name], sync);
  const removeCallback = _prepareRemoveCallback(_removeFileAsync, [fd, name], sync, removeCallbackSync);

  if (!opts.keep) _removeObjects.unshift(removeCallbackSync);

  return sync ? removeCallbackSync : removeCallback;
}

function _prepareTmpDirRemoveCallback(name, opts, sync) {
  const removeFunction = opts.unsafeCleanup ? rimraf : fs.rmdir.bind(fs);
  const removeFunctionSync = opts.unsafeCleanup ? rimraf.sync : fs.rmdirSync;
  const removeCallbackSync = _prepareRemoveCallback(removeFunctionSync, name, sync);
  const removeCallback = _prepareRemoveCallback(removeFunction, name, sync, removeCallbackSync);
  if (!opts.keep) _removeObjects.unshift(removeCallbackSync);

  return sync ? removeCallbackSync : removeCallback;
}

function _prepareRemoveCallback(removeFunction, fileOrDirName, sync, cleanupCallbackSync) {
  let called = false;

  return function cleanupCallback(next) {
    if (!called) {
      const toRemove = cleanupCallbackSync || cleanupCallback;
      const index = _removeObjects.indexOf(toRemove);
      if (index >= 0) _removeObjects.splice(index, 1);

      called = true;
      if (sync) {
        return removeFunction(fileOrDirName);
      } else {
        return removeFunction(fileOrDirName, next || function() {});
      }
    }
  };
}

function _garbageCollector() {
  if (!_gracefulCleanup) return;

  while (_removeObjects.length) {
    try {
      _removeObjects[0]();
    } catch (e) {
    }
  }
}

function _randomChars(howMany) {
  let value = [];
  let rnd = null;

  try {
    rnd = crypto.randomBytes(howMany);
  } catch (e) {
    rnd = crypto.pseudoRandomBytes(howMany);
  }

  for (let i = 0; i < howMany; i++) {
    value.push(RANDOM_CHARS[rnd[i] % RANDOM_CHARS.length]);
  }

  return value.join('');
}

function _isBlank(s) {
  return s === null || typeof s === 'undefined' || !s.trim();
}

function _parseArguments(options, callback) {
  if (typeof options === 'function') {
    return [{}, options];
  }

  if (typeof options === 'undefined') {
    return [{}, callback];
  }

  const actualOptions = {};
  for (const key of Object.getOwnPropertyNames(options)) {
    actualOptions[key] = options[key];
  }

  return [actualOptions, callback];
}

function _generateTmpName(opts) {
  const tmpDir = opts.tmpdir;

  if (opts.name) {
    return path.join(tmpDir, opts.dir, opts.name);
  }

  if (opts.template) {
    return path.join(tmpDir, opts.dir, opts.template).replace(TEMPLATE_PATTERN, _randomChars(6));
  }

  const name = [
    opts.prefix || 'tmp',
    '-',
    process.pid,
    '-',
    _randomChars(12),
    opts.postfix ? '-' + opts.postfix : ''
  ].join('');

  return path.join(tmpDir, opts.dir, name);
}

function _assertAndSanitizeOptions(options) {
  options.tmpdir = _getTmpDir(options);

  const tmpDir = options.tmpdir;

  if (options.name) _assertIsRelative(options.name, 'name', tmpDir);
  if (options.dir) _assertIsRelative(options.dir, 'dir', tmpDir);
  if (options.template) {
    _assertIsRelative(options.template, 'template', tmpDir);
    if (!options.template.match(TEMPLATE_PATTERN))
      throw new Error(`Invalid template, found "${options.template}".`);
  }
  if (options.tries && isNaN(options.tries)) throw new Error(`Invalid tries, found "${options.tries}".`);

  options.tries = options.name ? 1 : options.tries || DEFAULT_TRIES;
  options.keep = !!options.keep;
  options.detachDescriptor = !!options.detachDescriptor;
  options.discardDescriptor = !!options.discardDescriptor;
  options.unsafeCleanup = !!options.unsafeCleanup;

  options.dir = options.dir ? path.relative(tmpDir, _resolvePath(options.dir, tmpDir)) : '';
  options.template = options.template ? path.relative(tmpDir, _resolvePath(options.template, tmpDir)) : undefined;
  options.template = options.template ? path.relative(options.dir, options.template) : undefined;

  options.name = options.name ? _sanitizeName(options.name) : undefined;
  options.prefix = options.prefix || '';
  options.postfix = options.postfix || '';
}

function _resolvePath(name, tmpDir) {
  const sanitizedName = _sanitizeName(name);
  return sanitizedName.startsWith(tmpDir) ? path.resolve(sanitizedName) : path.resolve(path.join(tmpDir, sanitizedName));
}

function _sanitizeName(name) {
  return name ? name.replace(/["']/g, '') : name;
}

function _assertIsRelative(name, option, tmpDir) {
  if (option === 'name') {
    if (path.isAbsolute(name)) throw new Error(`${option} option must not contain an absolute path, found "${name}".`);
    let basename = path.basename(name);
    if (basename === '..' || basename === '.' || basename !== name)
      throw new Error(`${option} option must not contain a path, found "${name}".`);
  } else {
    if (path.isAbsolute(name) && !name.startsWith(tmpDir))
      throw new Error(`${option} option must be relative to "${tmpDir}", found "${name}".`);
    let resolvedPath = _resolvePath(name, tmpDir);
    if (!resolvedPath.startsWith(tmpDir))
      throw new Error(`${option} option must be relative to "${tmpDir}", found "${resolvedPath}".`);
  }
}

function _isEBADF(error) {
  return IS_WIN32 ? error.code === 'EBADF' : error.code === 'EBADF' && error.errno === -EBADF;
}

function _isENOENT(error) {
  return IS_WIN32 ? error.code === 'ENOENT' : error.code === 'ENOENT' && error.errno === -ENOENT;
}

function setGracefulCleanup() {
  _gracefulCleanup = true;
}

function _getTmpDir(options) {
  return path.resolve(_sanitizeName(options && options.tmpdir || os.tmpdir()));
}

process.addListener('exit', _garbageCollector);

module.exports = {
  get tmpdir() { return _getTmpDir(); },
  dir,
  dirSync,
  file,
  fileSync,
  tmpName,
  tmpNameSync,
  setGracefulCleanup
};
