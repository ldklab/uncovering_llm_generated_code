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
    get: function() {
      return queue;
    }
  });
}

let debug = noop;
if (util.debuglog)
  debug = util.debuglog('gfs4');
else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ''))
  debug = function() {
    const m = 'GFS4: ' + util.format.apply(util, arguments).split('\n').join('\nGFS4: ');
    console.error(m);
  };

if (!fs[gracefulQueue]) {
  const queue = global[gracefulQueue] || [];
  publishQueue(fs, queue);

  fs.close = (function (fs$close) {
    function close(fd, cb) {
      return fs$close.call(fs, fd, function (err) {
        if (!err) {
          resetQueue();
        }
        if (typeof cb === 'function') cb.apply(this, arguments);
      });
    }
    Object.defineProperty(close, previousSymbol, { value: fs$close });
    return close;
  })(fs.close);

  fs.closeSync = (function (fs$closeSync) {
    function closeSync(fd) {
      fs$closeSync.apply(fs, arguments);
      resetQueue();
    }
    Object.defineProperty(closeSync, previousSymbol, { value: fs$closeSync });
    return closeSync;
  })(fs.closeSync);

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

  fs.readFile = wrapRetryFileOperation(fs.readFile, 'readFile');
  fs.writeFile = wrapRetryFileOperation(fs.writeFile, 'writeFile');
  fs.appendFile = wrapRetryFileOperation(fs.appendFile, 'appendFile');
  fs.copyFile = wrapRetryFileOperation(fs.copyFile, 'copyFile');
  fs.readdir = wrapRetryFileOperation(fs.readdir, 'readdir');

  if (process.version.startsWith('v0.8')) {
    const legStreams = legacy(fs);
    ReadStream = legStreams.ReadStream;
    WriteStream = legStreams.WriteStream;
  }

  setupStreamPrototypes(fs);

  return fs;
}

function wrapRetryFileOperation(originalFunction, functionName) {
  return function (...args) {
    const cb = typeof args[args.length - 1] === 'function' ? args.pop() : undefined;
    return go(...args, cb);

    function go(...innerArgs) {
      const innerCb = typeof innerArgs[innerArgs.length - 1] === 'function' ? innerArgs.pop() : undefined;
      originalFunction(...innerArgs, function (err, ...results) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) {
          enqueue([go, innerArgs.concat(innerCb), err, Date.now(), Date.now()]);
        } else if (typeof innerCb === 'function') {
          innerCb(err, ...results);
        }
      });
    }
  };
}

function setupStreamPrototypes(fs) {
  const fs$ReadStream = fs.ReadStream;
  if (fs$ReadStream) {
    ReadStream.prototype = Object.create(fs$ReadStream.prototype);
    ReadStream.prototype.open = ReadStreamOpen;
  }

  const fs$WriteStream = fs.WriteStream;
  if (fs$WriteStream) {
    WriteStream.prototype = Object.create(fs$WriteStream.prototype);
    WriteStream.prototype.open = WriteStreamOpen;
  }

  fs.ReadStream = ReadStream;
  fs.WriteStream = WriteStream;
  fs.FileReadStream = ReadStream;
  fs.FileWriteStream = WriteStream;
}

function ReadStreamOpen() {
  openStream(this, this.path, this.flags, this.mode);
}

function WriteStreamOpen() {
  openStream(this, this.path, this.flags, this.mode);
}

function openStream(stream, path, flags, mode) {
  open(path, flags, mode, function (err, fd) {
    if (err) {
      if (stream.autoClose) stream.destroy();
      stream.emit('error', err);
    } else {
      stream.fd = fd;
      stream.emit('open', fd);
    }
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
  fs[gracefulQueue].forEach(item => {
    if (item.length > 2) {
      item[3] = now;
      item[4] = now;
    }
  });
  retry();
}

function retry() {
  clearTimeout(retryTimer);
  retryTimer = undefined;

  if (!fs[gracefulQueue].length) return;

  const elem = fs[gracefulQueue].shift();
  const [fn, args, err, startTime, lastTime] = elem;
  
  if (startTime === undefined) {
    debug('RETRY', fn.name, args);
    fn.apply(null, args);
  } else if (Date.now() - startTime >= 60000) {
    debug('TIMEOUT', fn.name, args);
    const cb = args.pop();
    if (typeof cb === 'function') cb(err);
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
