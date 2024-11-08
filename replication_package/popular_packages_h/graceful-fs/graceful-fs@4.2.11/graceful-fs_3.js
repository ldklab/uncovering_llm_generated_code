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
    get: () => queue,
  });
}

let debug = noop;
if (util.debuglog) {
  debug = util.debuglog('gfs4');
} else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) {
  debug = function() {
    const message = util.format.apply(util, arguments);
    console.error('GFS4: ' + message.split(/\n/).join('\nGFS4: '));
  };
}

if (!fs[gracefulQueue]) {
  const queue = global[gracefulQueue] || [];
  publishQueue(fs, queue);
  
  fs.close = createPatchedClose(fs.close, resetQueue);
  fs.closeSync = createPatchedCloseSync(fs.closeSync, resetQueue);

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

  const methods = ['readFile', 'writeFile', 'appendFile', 'copyFile', 'readdir', 'open'];
  const methodHandlers = [handleReadFile, handleWriteFile, handleAppendFile, handleCopyFile, handleReaddir, handleOpen];
  methods.forEach((method, index) => {
    if (fs[method]) fs[method] = methodHandlers[index](fs[method]);
  });

  let ReadStream, WriteStream;
  if (process.version.substr(0, 4) === 'v0.8') {
    ({ ReadStream, WriteStream } = legacy(fs));
  }

  setupStreams(fs);

  return fs;
}

function createPatchedClose(originalClose, resetQueueFn) {
  return function(fd, cb) {
    return originalClose.call(fs, fd, function(err) {
      if (!err) resetQueueFn();
      if (typeof cb === 'function') cb.apply(this, arguments);
    });
  };
}

function createPatchedCloseSync(originalCloseSync, resetQueueFn) {
  return function(fd) {
    originalCloseSync.apply(fs, arguments);
    resetQueueFn();
  };
}

function handleReadFile(originalReadFile) {
  return function readFile(path, options, cb) {
    if (typeof options === 'function') cb = options, options = null;

    return executeFSFunction(originalReadFile, [path, options, cb], ['EMFILE', 'ENFILE']);
  };
}

function handleWriteFile(originalWriteFile) {
  return function writeFile(path, data, options, cb) {
    if (typeof options === 'function') cb = options, options = null;

    return executeFSFunction(originalWriteFile, [path, data, options, cb], ['EMFILE', 'ENFILE']);
  };
}

function handleAppendFile(originalAppendFile) {
  return function appendFile(path, data, options, cb) {
    if (typeof options === 'function') cb = options, options = null;
    
    return executeFSFunction(originalAppendFile, [path, data, options, cb], ['EMFILE', 'ENFILE']);
  };
}

function handleCopyFile(originalCopyFile) {
  return function copyFile(src, dest, flags, cb) {
    if (typeof flags === 'function') cb = flags, flags = 0;

    return executeFSFunction(originalCopyFile, [src, dest, flags, cb], ['EMFILE', 'ENFILE']);
  };
}

function handleReaddir(originalReaddir) {
  return function readdir(path, options, cb) {
    if (typeof options === 'function') cb = options, options = null;

    return readdirHelper(path, options, cb);
  };

  function readdirHelper(path, options, cb) {
    const goReaddir = (path, options, cb, startTime) => {
      const callback = readdirCallback(path, options, cb, startTime);
      return /^v[0-5]\./.test(process.version) ? originalReaddir(path, callback) : originalReaddir(path, options, callback);
    };

    return executeFSFunction(goReaddir, [path, options, cb], ['EMFILE', 'ENFILE']);
  }

  function readdirCallback(path, options, cb, startTime) {
    return function(err, files) {
      if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) {
        enqueue([readdirHelper, [path, options, cb], err, startTime || Date.now(), Date.now()]);
      } else {
        if (files && files.sort) files.sort();
        if (typeof cb === 'function') cb.call(this, err, files);
      }
    };
  }
}

function handleOpen(originalOpen) {
  return function open(path, flags, mode, cb) {
    if (typeof mode === 'function') cb = mode, mode = null;

    return executeFSFunction(originalOpen, [path, flags, mode, cb], ['EMFILE', 'ENFILE']);
  };
}

function executeFSFunction(fn, args, errorCodes) {
  const goFn = (startTime) => {
    return fn(...args, function(err) {
      if (err && errorCodes.includes(err.code)) {
        enqueue([goFn, [startTime || Date.now(), Date.now()]]);
      } else {
        const cb = args[args.length - 1];
        if (typeof cb === 'function') cb.apply(this, arguments);
      }
    });
  };

  goFn();
}

function setupStreams(fs) {
  const setupStream = (Stream, openFn) => {
    return class extends Stream {
      constructor(path, options) {
        super(path, options);
      }

      open() {
        const that = this;
        open(that.path, that.flags, that.mode, function(err, fd) {
          if (err) {
            if (that.autoClose) that.destroy();
            that.emit('error', err);
          } else {
            that.fd = fd;
            that.emit('open', fd);
            if (that instanceof fs.ReadStream) that.read();
          }
        });
      }
    };
  };

  if (fs.ReadStream) fs.ReadStream = setupStream(fs.ReadStream, open);
  if (fs.WriteStream) fs.WriteStream = setupStream(fs.WriteStream, open);

  Object.defineProperty(fs, 'FileReadStream', {
    get: () => fs.ReadStream,
    set: (val) => (fs.ReadStream = val),
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(fs, 'FileWriteStream', {
    get: () => fs.WriteStream,
    set: (val) => (fs.WriteStream = val),
    enumerable: true,
    configurable: true,
  });
}

function createReadStream(path, options) {
  return new fs.ReadStream(path, options);
}

function createWriteStream(path, options) {
  return new fs.WriteStream(path, options);
}

function enqueue(elem) {
  debug('ENQUEUE', elem[0].name, elem[1]);
  fs[gracefulQueue].push(elem);
  retry();
}

let retryTimer;

function resetQueue() {
  const now = Date.now();
  for (const elem of fs[gracefulQueue]) {
    if (elem.length > 2) {
      elem[3] = now;
      elem[4] = now;
    }
  }
  retry();
}

function retry() {
  clearTimeout(retryTimer);
  retryTimer = undefined;

  if (fs[gracefulQueue].length === 0) return;

  const elem = fs[gracefulQueue].shift();
  const [fn, args, err, startTime, lastTime] = elem;

  if (startTime === undefined || Date.now() - startTime >= 60000) {
    if (startTime === undefined) {
      debug('RETRY', fn.name, args);
      fn(...args);
    } else {
      debug('TIMEOUT', fn.name, args);
      const cb = args.pop();
      if (typeof cb === 'function') cb.call(null, err);
    }
  } else {
    const sinceAttempt = Date.now() - lastTime;
    const sinceStart = Math.max(lastTime - startTime, 1);
    const desiredDelay = Math.min(sinceStart * 1.2, 100);

    if (sinceAttempt >= desiredDelay) {
      debug('RETRY', fn.name, args);
      fn(...args, startTime);
    } else {
      fs[gracefulQueue].push(elem);
    }
  }

  if (retryTimer === undefined) {
    retryTimer = setTimeout(retry, 0);
  }
}
