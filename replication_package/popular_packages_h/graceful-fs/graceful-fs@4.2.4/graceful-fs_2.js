const fs = require('fs');
const polyfills = require('./polyfills.js');
const legacy = require('./legacy-streams.js');
const clone = require('./clone.js');
const util = require('util');

// Initialize symbols or fallback strings for queue management
const gracefulQueue = typeof Symbol === 'function' && typeof Symbol.for === 'function' ? Symbol.for('graceful-fs.queue') : '___graceful-fs.queue';
const previousSymbol = typeof Symbol === 'function' && typeof Symbol.for === 'function' ? Symbol.for('graceful-fs.previous') : '___graceful-fs.previous';

// Function to publish the queue to a given context
function publishQueue(context, queue) {
  Object.defineProperty(context, gracefulQueue, {
    get: () => queue
  });
}

// Setup debug function based on util.debuglog
let debug = () => {};
if (util.debuglog) {
  debug = util.debuglog('gfs4');
} else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) {
  debug = (...args) => {
    const message = 'GFS4: ' + util.format(...args).split('\n').join('\nGFS4: ');
    console.error(message);
  };
}

// Initialize and patch fs with graceful queue mechanism
if (!fs[gracefulQueue]) {
  const queue = global[gracefulQueue] || [];
  publishQueue(fs, queue);

  fs.close = ((originalClose) => {
    function close(fd, callback) {
      return originalClose.call(fs, fd, (err) => {
        if (!err) retry();
        if (typeof callback === 'function') callback.apply(this, arguments);
      });
    }
    Object.defineProperty(close, previousSymbol, { value: originalClose });
    return close;
  })(fs.close);

  fs.closeSync = ((originalCloseSync) => {
    function closeSync(fd) {
      originalCloseSync.apply(fs, arguments);
      retry();
    }
    Object.defineProperty(closeSync, previousSymbol, { value: originalCloseSync });
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

// Main patch function for fs module
function patch(fs) {
  polyfills(fs);
  fs.gracefulify = patch;

  fs.createReadStream = createReadStream;
  fs.createWriteStream = createWriteStream;

  patchMethod('readFile', fs.readFile, handleFileOp);
  patchMethod('writeFile', fs.writeFile, handleFileOp);
  patchMethod('appendFile', fs.appendFile, handleFileOp, true);
  patchMethod('readdir', fs.readdir, handleReaddir);

  configureStreams(fs);

  return fs;
}

// Helper method to patch file operations
function patchMethod(name, originalMethod, handler, optional = false) {
  if (!originalMethod && optional) return;
  fs[name] = function (...args) {
    const cb = typeof args[args.length - 1] === 'function' ? args.pop() : null;
    handler(name, args, cb, originalMethod);
  };
}

// Handle common file operations
function handleFileOp(name, args, cb, originalMethod) {
  const retryOp = () => originalMethod.apply(fs, [...args, callback]);

  const callback = (err, ...results) => {
    if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) {
      enqueue([retryOp, args]);
    } else {
      if (cb) cb(err, ...results);
      retry();
    }
  };

  retryOp();
}

// Handle readdir operation with sorting
function handleReaddir(name, args, cb, originalMethod) {
  const retryOp = () => goReaddir(args, callback);

  const callback = (err, files) => {
    if (files && files.sort) files.sort();
    if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) {
      enqueue([retryOp, args]);
    } else {
      if (cb) cb(err, files);
      retry();
    }
  };

  retryOp();
}

// Wrapper for readdir execution
function goReaddir(args, cb) {
  return fs.readdir.apply(fs, [...args, cb]);
}

// Configure streams like ReadStream and WriteStream
function configureStreams(fs) {
  let ReadStream = configureStream('ReadStream', fs.ReadStream, ReadStreamOpen);
  let WriteStream = configureStream('WriteStream', fs.WriteStream, WriteStreamOpen);

  Object.defineProperties(fs, {
    ReadStream: { get: () => ReadStream, set: (val) => { ReadStream = val; }, enumerable: true, configurable: true },
    WriteStream: { get: () => WriteStream, set: (val) => { WriteStream = val; }, enumerable: true, configurable: true },
    FileReadStream: { get: () => ReadStream, set: (val) => { ReadStream = val; }, enumerable: true, configurable: true },
    FileWriteStream: { get: () => WriteStream, set: (val) => { WriteStream = val; }, enumerable: true, configurable: true }
  });

  function configureStream(name, OriginalStream, openMethod) {
    function StreamConstructor(path, options) {
      if (!(this instanceof StreamConstructor)) return new StreamConstructor(path, options);
      return OriginalStream.apply(this, [path, options]), this;
    }
    StreamConstructor.prototype = Object.create(OriginalStream.prototype);
    StreamConstructor.prototype.open = openMethod;
    return StreamConstructor;
  }

  function ReadStreamOpen() {
    open(this.path, this.flags, this.mode, (err, fd) => manageStreamOpen(this, err, fd));
  }

  function WriteStreamOpen() {
    open(this.path, this.flags, this.mode, (err, fd) => manageStreamOpen(this, err, fd));
  }
}

// Stream open error management
function manageStreamOpen(stream, err, fd) {
  if (err) {
    if (stream.autoClose) stream.destroy();
    stream.emit('error', err);
  } else {
    stream.fd = fd;
    stream.emit('open', fd);
  }
}

// Enqueue an operation for retry
function enqueue(op) {
  debug('ENQUEUE', op[0].name, op[1]);
  fs[gracefulQueue].push(op);
}

// Retry operations from the queue
function retry() {
  const op = fs[gracefulQueue].shift();
  if (op) {
    debug('RETRY', op[0].name, op[1]);
    op[0].apply(null, op[1]);
  }
}

// Create ReadStream with configured ReadStream constructor
function createReadStream(path, options) {
  return new fs.ReadStream(path, options);
}

// Create WriteStream with configured WriteStream constructor
function createWriteStream(path, options) {
  return new fs.WriteStream(path, options);
}

// Patch open method to include EMFILE/ENFILE handling
const origOpen = fs.open;
fs.open = function (path, flags, mode, cb) {
  const args = [path, flags, typeof mode === 'function' ? undefined : mode, mode === cb ? undefined : cb];
  handleFileOp('open', args, cb, origOpen);
};
