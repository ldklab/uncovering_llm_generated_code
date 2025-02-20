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
if (util.debuglog) {
  debug = util.debuglog('gfs4');
} else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) {
  debug = function() {
    const m = util.format.apply(util, arguments);
    console.error('GFS4: ' + m.split(/\n/).join('\nGFS4: '));
  };
}

if (!fs[gracefulQueue]) {
  const queue = global[gracefulQueue] || [];
  publishQueue(fs, queue);

  fs.close = ((fs$close) => {
    function close(fd, cb) {
      return fs$close.call(fs, fd, function(err) {
        if (!err) retry();
        if (typeof cb === 'function') cb.apply(this, arguments);
      });
    }

    Object.defineProperty(close, previousSymbol, {
      value: fs$close
    });
    return close;
  })(fs.close);

  fs.closeSync = ((fs$closeSync) => {
    function closeSync(fd) {
      fs$closeSync.apply(fs, arguments);
      retry();
    }

    Object.defineProperty(closeSync, previousSymbol, {
      value: fs$closeSync
    });
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

  const fs$readFile = fs.readFile;
  fs.readFile = function(path, options, cb) {
    if (typeof options === 'function') cb = options, options = null;
    return go$readFile(path, options, cb);

    function go$readFile(path, options, cb) {
      return fs$readFile(path, options, function(err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$readFile, [path, options, cb]]);
        else {
          if (typeof cb === 'function') cb.apply(this, arguments);
          retry();
        }
      });
    }
  };

  const fs$writeFile = fs.writeFile;
  fs.writeFile = function(path, data, options, cb) {
    if (typeof options === 'function') cb = options, options = null;
    return go$writeFile(path, data, options, cb);

    function go$writeFile(path, data, options, cb) {
      return fs$writeFile(path, data, options, function(err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$writeFile, [path, data, options, cb]]);
        else {
          if (typeof cb === 'function') cb.apply(this, arguments);
          retry();
        }
      });
    }
  };

  const fs$appendFile = fs.appendFile;
  if (fs$appendFile) {
    fs.appendFile = function(path, data, options, cb) {
      if (typeof options === 'function') cb = options, options = null;
      return go$appendFile(path, data, options, cb);

      function go$appendFile(path, data, options, cb) {
        return fs$appendFile(path, data, options, function(err) {
          if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
            enqueue([go$appendFile, [path, data, options, cb]]);
          else {
            if (typeof cb === 'function') cb.apply(this, arguments);
            retry();
          }
        });
      }
    };
  }

  const fs$readdir = fs.readdir;
  fs.readdir = function(path, options, cb) {
    const args = [path];
    if (typeof options !== 'function') args.push(options);
    else cb = options;
    args.push(go$readdir$cb);

    return go$readdir(args);

    function go$readdir$cb(err, files) {
      if (files && files.sort) files.sort();
      if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
        enqueue([go$readdir, [args]]);
      else {
        if (typeof cb === 'function') cb.apply(this, arguments);
        retry();
      }
    }
  };

  function go$readdir(args) {
    return fs$readdir.apply(fs, args);
  }

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
    get: function() {
      return ReadStream;
    },
    set: function(val) {
      ReadStream = val;
    },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(fs, 'WriteStream', {
    get: function() {
      return WriteStream;
    },
    set: function(val) {
      WriteStream = val;
    },
    enumerable: true,
    configurable: true
  });

  const FileReadStream = ReadStream;
  Object.defineProperty(fs, 'FileReadStream', {
    get: function() {
      return FileReadStream;
    },
    set: function(val) {
      FileReadStream = val;
    },
    enumerable: true,
    configurable: true
  });

  const FileWriteStream = WriteStream;
  Object.defineProperty(fs, 'FileWriteStream', {
    get: function() {
      return FileWriteStream;
    },
    set: function(val) {
      FileWriteStream = val;
    },
    enumerable: true,
    configurable: true
  });

  function ReadStream(path, options) {
    if (this instanceof ReadStream) return fs$ReadStream.apply(this, arguments), this;
    return ReadStream.apply(Object.create(ReadStream.prototype), arguments);
  }

  function ReadStream$open() {
    const that = this;
    open(that.path, that.flags, that.mode, function(err, fd) {
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
    if (this instanceof WriteStream) return fs$WriteStream.apply(this, arguments), this;
    return WriteStream.apply(Object.create(WriteStream.prototype), arguments);
  }

  function WriteStream$open() {
    const that = this;
    open(that.path, that.flags, that.mode, function(err, fd) {
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

  const fs$open = fs.open;
  fs.open = function(path, flags, mode, cb) {
    if (typeof mode === 'function') cb = mode, mode = null;
    return go$open(path, flags, mode, cb);

    function go$open(path, flags, mode, cb) {
      return fs$open(path, flags, mode, function(err, fd) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$open, [path, flags, mode, cb]]);
        else {
          if (typeof cb === 'function') cb.apply(this, arguments);
          retry();
        }
      });
    }
  };

  return fs;
}

function enqueue(elem) {
  debug('ENQUEUE', elem[0].name, elem[1]);
  fs[gracefulQueue].push(elem);
}

function retry() {
  const elem = fs[gracefulQueue].shift();
  if (elem) {
    debug('RETRY', elem[0].name, elem[1]);
    elem[0].apply(null, elem[1]);
  }
}
