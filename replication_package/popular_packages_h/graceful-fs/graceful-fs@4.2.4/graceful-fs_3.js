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

const noop = () => {};
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

  fs.close = (function(originalClose) {
    return function(fd, cb) {
      return originalClose.call(fs, fd, function(err) {
        if (!err) retry();
        if (typeof cb === 'function') cb.apply(this, arguments);
      });
    }
  })(fs.close);

  fs.closeSync = (function(originalCloseSync) {
    return function(fd) {
      originalCloseSync.apply(fs, arguments);
      retry();
    }
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

function publishQueue(context, queue) {
  Object.defineProperty(context, gracefulQueue, {
    get: function() {
      return queue;
    }
  });
}

function patch(fsInstance) {
  polyfills(fsInstance);
  fsInstance.gracefulify = patch;

  const methodsToPatch = ['readFile', 'writeFile', 'appendFile', 'readdir', 'open'];
  methodsToPatch.forEach(methodName => {
    const originalMethod = fsInstance[methodName];
    if (originalMethod) {
      fsInstance[methodName] = function(...args) {
        const cb = args.pop();
        return originalMethod.call(fsInstance, ...args, function(err, ...results) {
          if (err && (err.code === 'EMFILE' || err.code === 'ENFILE')) {
            enqueue([fsInstance[methodName], args.concat(cb)]);
          } else {
            if (typeof cb === 'function') cb.apply(this, [err, ...results]);
            retry();
          }
        });
      }
    }
  });

  return fsInstance;
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
