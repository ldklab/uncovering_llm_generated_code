const fs = require('fs');
const polyfills = require('./polyfills.js');
const legacy = require('./legacy-streams.js');
const clone = require('./clone.js');
const util = require('util');

let gracefulQueue;
let previousSymbol;

if (typeof Symbol === 'function' && typeof Symbol.for === 'function') {
  gracefulQueue = Symbol.for('graceful-fs.queue');
  previousSymbol = Symbol.for('graceful-fs.previous');
} else {
  gracefulQueue = '___graceful-fs.queue';
  previousSymbol = '___graceful-fs.previous';
}

function noop() {}

function publishQueue(context, queue) {
  Object.defineProperty(context, gracefulQueue, {
    get() {
      return queue;
    }
  });
}

let debug = noop;
if (util.debuglog)
  debug = util.debuglog('gfs4');
else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ''))
  debug = function() {
    const m = util.format.apply(util, arguments);
    console.error('GFS4: ' + m.split(/\n/).join('\nGFS4: '));
  };

if (!fs[gracefulQueue]) {
  const queue = global[gracefulQueue] || [];
  publishQueue(fs, queue);

  fs.close = (function (origClose) {
    function close(fd, cb) {
      return origClose.call(fs, fd, function (err) {
        if (!err) resetQueue();
        if (typeof cb === 'function') cb.apply(this, arguments);
      });
    }
    Object.defineProperty(close, previousSymbol, { value: origClose });
    return close;
  })(fs.close);

  fs.closeSync = (function (origCloseSync) {
    function closeSync(fd) {
      origCloseSync.apply(fs, arguments);
      resetQueue();
    }
    Object.defineProperty(closeSync, previousSymbol, { value: origCloseSync });
    return closeSync;
  })(fs.closeSync);

  if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) {
    process.on('exit', () => {
      debug(fs[gracefulQueue]);
      require('assert').equal(fs[gracefulQueue].length, 0);
    });
  }
}

if (!global[gracefulQueue]) {
  publishQueue(global, fs[gracefulQueue]);
}

module.exports = patch(clone(fs));
if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs.__patched) {
  module.exports = patch(fs);
  fs.__patched = true;
}

function patch(fs) {
  polyfills(fs);
  fs.gracefulify = patch;

  fs.createReadStream = createReadStream;
  fs.createWriteStream = createWriteStream;

  fs.readFile = (function (origReadFile) {
    return function readFile(path, options, cb) {
      if (typeof options === 'function') cb = options, options = null;
      go$readFile(path, options, cb);

      function go$readFile(path, options, cb, startTime) {
        return origReadFile(path, options, function (err) {
          if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
            enqueue([go$readFile, [path, options, cb], err, startTime || Date.now(), Date.now()]);
          else if (typeof cb === 'function') cb.apply(this, arguments);
        });
      }
    };
  })(fs.readFile);

  fs.writeFile = (function (origWriteFile) {
    return function writeFile(path, data, options, cb) {
      if (typeof options === 'function') cb = options, options = null;
      go$writeFile(path, data, options, cb);

      function go$writeFile(path, data, options, cb, startTime) {
        return origWriteFile(path, data, options, function (err) {
          if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
            enqueue([go$writeFile, [path, data, options, cb], err, startTime || Date.now(), Date.now()]);
          else if (typeof cb === 'function') cb.apply(this, arguments);
        });
      }
    };
  })(fs.writeFile);

  if (fs.appendFile) {
    fs.appendFile = (function (origAppendFile) {
      return function appendFile(path, data, options, cb) {
        if (typeof options === 'function') cb = options, options = null;
        go$appendFile(path, data, options, cb);

        function go$appendFile(path, data, options, cb, startTime) {
          return origAppendFile(path, data, options, function (err) {
            if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
              enqueue([go$appendFile, [path, data, options, cb], err, startTime || Date.now(), Date.now()]);
            else if (typeof cb === 'function') cb.apply(this, arguments);
          });
        }
      };
    })(fs.appendFile);
  }

  if (fs.copyFile) {
    fs.copyFile = (function (origCopyFile) {
      return function copyFile(src, dest, flags, cb) {
        if (typeof flags === 'function') {
          cb = flags;
          flags = 0;
        }
        go$copyFile(src, dest, flags, cb);

        function go$copyFile(src, dest, flags, cb, startTime) {
          return origCopyFile(src, dest, flags, function (err) {
            if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
              enqueue([go$copyFile, [src, dest, flags, cb], err, startTime || Date.now(), Date.now()]);
            else if (typeof cb === 'function') cb.apply(this, arguments);
          });
        }
      };
    })(fs.copyFile);
  }

  fs.readdir = (function (origReaddir) {
    return function readdir(path, options, cb) {
      if (typeof options === 'function') cb = options, options = null;
      let go$readdir;
      if (/^v[0-5]\./.test(process.version)) {
        go$readdir = function (path, options, cb, startTime) {
          return origReaddir(path, fs$readdirCallback(path, options, cb, startTime));
        };
      } else {
        go$readdir = function (path, options, cb, startTime) {
          return origReaddir(path, options, fs$readdirCallback(path, options, cb, startTime));
        };
      }
      go$readdir(path, options, cb);
    };

    function fs$readdirCallback(path, options, cb, startTime) {
      return function (err, files) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$readdir, [path, options, cb], err, startTime || Date.now(), Date.now()]);
        else {
          if (files && files.sort) files.sort();
          if (typeof cb === 'function') cb.call(this, err, files);
        }
      }
    }
  })(fs.readdir);

  if (process.version.startsWith('v0.8')) {
    const legStreams = legacy(fs);
    ReadStream = legStreams.ReadStream;
    WriteStream = legStreams.WriteStream;
  }

  const fs$ReadStream = fs.ReadStream;
  if (fs$ReadStream) {
    ReadStream.prototype = Object.create(fs$ReadStream.prototype);
    ReadStream.prototype.open = ReadStream$open;
  }

  const fs$WriteStream = fs.WriteStream;
  if (fs$WriteStream) {
    WriteStream.prototype = Object.create(fs$WriteStream.prototype);
    WriteStream.prototype.open = WriteStream$open;
  }

  Object.defineProperty(fs, 'ReadStream', {
    get() { return ReadStream; },
    set(val) { ReadStream = val; },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(fs, 'WriteStream', {
    get() { return WriteStream; },
    set(val) { WriteStream = val; },
    enumerable: true,
    configurable: true
  });

  let FileReadStream = ReadStream;
  Object.defineProperty(fs, 'FileReadStream', {
    get() { return FileReadStream; },
    set(val) { FileReadStream = val; },
    enumerable: true,
    configurable: true
  });

  let FileWriteStream = WriteStream;
  Object.defineProperty(fs, 'FileWriteStream', {
    get() { return FileWriteStream; },
    set(val) { FileWriteStream = val; },
    enumerable: true,
    configurable: true
  });

  function ReadStream(path, options) {
    if (this instanceof ReadStream)
      return fs$ReadStream.apply(this, arguments), this;
    else
      return ReadStream.apply(Object.create(ReadStream.prototype), arguments);
  }

  function ReadStream$open() {
    const that = this;
    open(that.path, that.flags, that.mode, function (err, fd) {
      if (err) {
        if (that.autoClose) that.destroy();
        that.emit('error', err);
      } else {
        that.fd = fd;
        that.emit('open', fd);
        that.read();
      }
    });
  }

  function WriteStream(path, options) {
    if (this instanceof WriteStream)
      return fs$WriteStream.apply(this, arguments), this;
    else
      return WriteStream.apply(Object.create(WriteStream.prototype), arguments);
  }

  function WriteStream$open() {
    const that = this;
    open(that.path, that.flags, that.mode, function (err, fd) {
      if (err) {
        that.destroy();
        that.emit('error', err);
      } else {
        that.fd = fd;
        that.emit('open', fd);
      }
    });
  }

  function createReadStream(path, options) {
    return new fs.ReadStream(path, options);
  }

  function createWriteStream(path, options) {
    return new fs.WriteStream(path, options);
  }

  fs.open = (function (origOpen) {
    return function open(path, flags, mode, cb) {
      if (typeof mode === 'function') cb = mode, mode = null;
      go$open(path, flags, mode, cb);

      function go$open(path, flags, mode, cb, startTime) {
        return origOpen(path, flags, mode, function (err, fd) {
          if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
            enqueue([go$open, [path, flags, mode, cb], err, startTime || Date.now(), Date.now()]);
          else if (typeof cb === 'function') cb.apply(this, arguments);
        });
      }
    };
  })(fs.open);

  return fs;
}

function enqueue(elem) {
  debug('ENQUEUE', elem[0].name, elem[1]);
  fs[gracefulQueue].push(elem);
  retry();
}

let retryTimer;

function resetQueue() {
  const now = Date.now();
  for (let i = 0; i < fs[gracefulQueue].length; ++i) {
    if (fs[gracefulQueue][i].length > 2) {
      fs[gracefulQueue][i][3] = now;
      fs[gracefulQueue][i][4] = now;
    }
  }
  retry();
}

function retry() {
  clearTimeout(retryTimer);
  retryTimer = undefined;

  if (fs[gracefulQueue].length === 0) return;

  const elem = fs[gracefulQueue].shift();
  const fn = elem[0];
  const args = elem[1];
  const err = elem[2];
  const startTime = elem[3];
  const lastTime = elem[4];

  if (startTime === undefined) {
    debug('RETRY', fn.name, args);
    fn.apply(null, args);
  } else if (Date.now() - startTime >= 60000) {
    debug('TIMEOUT', fn.name, args);
    if (typeof args[args.length - 1] === 'function') args[args.length - 1].call(null, err);
  } else {
    const sinceAttempt = Date.now() - lastTime;
    const sinceStart = Math.max(lastTime - startTime, 1);
    const desiredDelay = Math.min(sinceStart * 1.2, 100);

    if (sinceAttempt >= desiredDelay) {
      debug('RETRY', fn.name, args);
      fn.apply(null, args.concat([startTime]));
    } else {
      fs[gracefulQueue].push(elem);
    }
  }

  if (retryTimer === undefined) {
    retryTimer = setTimeout(retry, 0);
  }
}
