const fs = require('fs');
const util = require('util');
const polyfills = require('./polyfills.js');
const legacy = require('./legacy-streams.js');
const clone = require('./clone.js');

const gracefulQueue = Symbol.for('graceful-fs.queue');
const previousSymbol = Symbol.for('graceful-fs.previous');
let retryTimer;

function noop() {}

function publishQueue(context, queue) {
  Object.defineProperty(context, gracefulQueue, { get: () => queue });
}

function initializeDebugLog() {
  if (util.debuglog) return util.debuglog('gfs4');
  if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ''))
    return (...args) => console.error('GFS4:', util.format(...args).split('\n').join('\nGFS4: '));
  return noop;
}

const debug = initializeDebugLog();

function setupInitialQueue(fsModule) {
  if (!fsModule[gracefulQueue]) {
    const queue = global[gracefulQueue] || [];
    publishQueue(fsModule, queue);
    patchFsMethods(fsModule, queue);
  }
  if (!global[gracefulQueue]) {
    publishQueue(global, fs[gracefulQueue]);
  }
}

function patchFsMethods(fsModule, queue) {
  // Patching close and closeSync methods
  fsModule.close = patchMethod(fsModule.close, queue, resetQueue);
  fsModule.closeSync = patchMethod(fsModule.closeSync, queue, resetQueue, true);
  
  // Handle debug logging on exit
  if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) {
    process.on('exit', () => {
      debug(fsModule[gracefulQueue]);
      require('assert').equal(fsModule[gracefulQueue].length, 0);
    });
  }
}

function patchMethod(origMethod, queue, callback, isSync = false) {
  return function patched(...args) {
    const cb = args[args.length - 1];
    const invokeOriginal = isSync ? () => origMethod.apply(fs, args) : () => origMethod.apply(fs, args.slice(0, -1).concat([wrappedCallback]));
    
    function wrappedCallback(err, ...callbackArgs) {
      if (!err) callback();
      if (typeof cb === 'function') cb.apply(this, [err, ...callbackArgs]);
    }

    return isSync ? (invokeOriginal(), callback()) : invokeOriginal();
  };
}

function patchFs(fsModule) {
  // Applying polyfills and attaching patched methods
  polyfills(fsModule);
  fsModule.gracefulify = patchFs;
  
  fsModule.createReadStream = createReadStream;
  fsModule.createWriteStream = createWriteStream;
  
  fsModule.readFile = wrapFsMethod(fsModule.readFile);
  fsModule.writeFile = wrapFsMethod(fsModule.writeFile);
  fsModule.appendFile = fsModule.appendFile ? wrapFsMethod(fsModule.appendFile) : null;
  fsModule.copyFile = fsModule.copyFile ? wrapFsMethod(fsModule.copyFile) : null;
  fsModule.readdir = wrapReaddirMethod(fsModule.readdir);
  
  handleLegacyAndStreamCompatibility(fsModule);
  return fsModule;
}

function wrapFsMethod(method) {
  return function wrappedMethod(...args) {
    const path = args[0];
    const cb = args[args.length - 1];
    const invokeOriginal = () => method.apply(fs, args.slice(0, -1).concat([wrappedCallback]));

    function wrappedCallback(err, ...callbackArgs) {
      if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) {
        enqueueRetryOperation([invokeOriginal, args, err]);
      } else if (typeof cb === 'function') {
        cb.apply(this, [err, ...callbackArgs]);
      }
    }

    invokeOriginal();
  };
}

function wrapReaddirMethod(method) {
  return function readdirWrapped(...args) {
    const path = args[0];
    const cb = args[args.length - 1];
    const invokeOriginal = () => method.apply(fs, args.slice(0, -1).concat([wrappedCallback]));

    function wrappedCallback(err, files) {
      if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) {
        enqueueRetryOperation([invokeOriginal, args, err]);
      } else {
        if (files && files.sort) files.sort();
        if (typeof cb === 'function') cb.call(this, err, files);
      }
    }

    invokeOriginal();
  };
}

function handleLegacyAndStreamCompatibility(fsModule) {
  if (process.version.startsWith('v0.8')) {
    const { ReadStream, WriteStream } = legacy(fsModule);
    fsModule.ReadStream = ReadStream;
    fsModule.WriteStream = WriteStream;
  }
  
  if (fsModule.ReadStream) {
    patchStreamMethod(fsModule, 'ReadStream', openStreamMethod);
  }
  
  if (fsModule.WriteStream) {
    patchStreamMethod(fsModule, 'WriteStream', openStreamMethod);
  }
}

function openStreamMethod() {
  const { path, flags, mode, autoClose } = this;
  open(path, flags, mode, (err, fd) => {
    if (err) {
      if (autoClose) this.destroy();
      this.emit('error', err);
    } else {
      this.fd = fd;
      this.emit('open', fd);
      this.read();
    }
  });
}

function patchStreamMethod(fsModule, streamName, openMethod) {
  const fsStream = fsModule[streamName];
  const streamConstructor = function constructor(...args) {
    if (this instanceof fsStream) return fsStream.apply(this, args);
    return new fsStream(...args);
  };
  
  streamConstructor.prototype = Object.create(fsStream.prototype);
  streamConstructor.prototype.open = openMethod;
  
  defineStreamProperty(fsModule, streamName, streamConstructor);
  defineStreamProperty(fsModule, `File${streamName}`, streamConstructor);
}

function defineStreamProperty(fsModule, propName, value) {
  Object.defineProperty(fsModule, propName, {
    get: () => value,
    set: (val) => { value = val; },
    enumerable: true,
    configurable: true
  });
}

function enqueueRetryOperation(operation) {
  fs[gracefulQueue].push(operation);
  retry();
}

function retry() {
  clearTimeout(retryTimer);
  retryTimer = undefined;

  if (fs[gracefulQueue].length === 0) return;

  const [fn, args, err, startTime = Date.now(), lastTime = Date.now()] = fs[gracefulQueue].shift();

  if (Date.now() - startTime >= 60000) {
    const cb = args.pop();
    if (typeof cb === 'function') cb.call(null, err);
  } else {
    const sinceAttempt = Date.now() - lastTime;
    const sinceStart = Math.max(lastTime - startTime, 1);
    const desiredDelay = Math.min(sinceStart * 1.2, 100);

    if (sinceAttempt >= desiredDelay) {
      fn.apply(null, args.concat([startTime]));
    } else {
      fs[gracefulQueue].push([fn, args, err, startTime, Date.now()]);
    }
  }

  if (retryTimer === undefined) {
    retryTimer = setTimeout(retry, 0);
  }
}

function resetQueue() {
  const now = Date.now();
  fs[gracefulQueue].forEach((elem) => {
    if (elem.length > 2) {
      elem[3] = now;
      elem[4] = now;
    }
  });
  retry();
}

function open(path, flags, mode, cb) {
  if (typeof mode === 'function') cb = mode, mode = null;
  
  const fn = (...args) => fs.open(path, flags, mode, wrappedCallback);
  const wrappedCallback = function (err, fd) {
    if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) {
      enqueueRetryOperation([fn, arguments, err]);
    } else if (typeof cb === 'function') {
      cb.apply(this, [err, fd]);
    }
  };
  
  fn();
}

function createReadStream(path, options) {
  return new fs.ReadStream(path, options);
}

function createWriteStream(path, options) {
  return new fs.WriteStream(path, options);
}

setupInitialQueue(fs);
module.exports = patchFs(clone(fs));

if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs.__patched) {
  module.exports = patchFs(fs);
  fs.__patched = true;
}
