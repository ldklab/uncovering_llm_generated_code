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
  Object.defineProperty(context, gracefulQueue, { get: () => queue });
}

let debug = noop;
if (util.debuglog) {
  debug = util.debuglog('gfs4');
} else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) {
  debug = function() {
    const message = `GFS4: ${util.format.apply(util, arguments).split(/\n/).join('\nGFS4: ')}`;
    console.error(message);
  };
}

if (!fs[gracefulQueue]) {
  const queue = global[gracefulQueue] || [];
  publishQueue(fs, queue);

  fs.close = function(originalClose) {
    return function close(fd, cb) {
      return originalClose.call(fs, fd, function(err) {
        if (!err) retry();
        if (typeof cb === 'function') cb.apply(this, arguments);
      });
    };
  }(fs.close);

  fs.closeSync = function(originalCloseSync) {
    return function closeSync(fd) {
      originalCloseSync.apply(fs, arguments);
      retry();
    };
  }(fs.closeSync);

  if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) {
    process.on('exit', function() {
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

  const originalReadFile = fs.readFile;
  fs.readFile = function(path, options, cb) {
    if (typeof options === 'function') (cb = options), (options = null);
    return attemptReadFile(path, options, cb);
  };

  function attemptReadFile(path, options, cb) {
    return originalReadFile(path, options, function(err) {
      if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) {
        enqueue([attemptReadFile, [path, options, cb]]);
      } else {
        if (typeof cb === 'function') cb.apply(this, arguments);
        retry();
      }
    });
  }

  const originalWriteFile = fs.writeFile;
  fs.writeFile = function(path, data, options, cb) {
    if (typeof options === 'function') (cb = options), (options = null);
    return attemptWriteFile(path, data, options, cb);
  };

  function attemptWriteFile(path, data, options, cb) {
    return originalWriteFile(path, data, options, function(err) {
      if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) {
        enqueue([attemptWriteFile, [path, data, options, cb]]);
      } else {
        if (typeof cb === 'function') cb.apply(this, arguments);
        retry();
      }
    });
  }

  const originalAppendFile = fs.appendFile;
  if (originalAppendFile) {
    fs.appendFile = function(path, data, options, cb) {
      if (typeof options === 'function') (cb = options), (options = null);
      return attemptAppendFile(path, data, options, cb);
    };
  }

  function attemptAppendFile(path, data, options, cb) {
    return originalAppendFile(path, data, options, function(err) {
      if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) {
        enqueue([attemptAppendFile, [path, data, options, cb]]);
      } else {
        if (typeof cb === 'function') cb.apply(this, arguments);
        retry();
      }
    });
  }

  const originalReaddir = fs.readdir;
  fs.readdir = function(path, options, cb) {
    const args = Array.from(arguments);
    if (typeof options === 'function') args[1] = options;
    args.push(function(err, files) {
      if (files && files.sort) files.sort();
      if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) {
        enqueue([attemptReaddir, args]);
      } else {
        if (typeof cb === 'function') cb.apply(this, arguments);
        retry();
      }
    });

    return attemptReaddir(args);
  };

  function attemptReaddir(args) {
    return originalReaddir.apply(fs, args);
  }

  const originalOpen = fs.open;
  fs.open = function(path, flags, mode, cb) {
    if (typeof mode === 'function') (cb = mode), (mode = null);
    return attemptOpen(path, flags, mode, cb);
  };

  function attemptOpen(path, flags, mode, cb) {
    return originalOpen(path, flags, mode, function(err, fd) {
      if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) {
        enqueue([attemptOpen, [path, flags, mode, cb]]);
      } else {
        if (typeof cb === 'function') cb.apply(this, arguments);
        retry();
      }
    });
  }

  function createReadStream(path, options) {
    return new fs.ReadStream(path, options);
  }

  function createWriteStream(path, options) {
    return new fs.WriteStream(path, options);
  }

  return fs;
}

function enqueue(task) {
  debug('ENQUEUE', task[0].name, task[1]);
  fs[gracefulQueue].push(task);
}

function retry() {
  const task = fs[gracefulQueue].shift();
  if (task) {
    debug('RETRY', task[0].name, task[1]);
    task[0].apply(null, task[1]);
  }
}