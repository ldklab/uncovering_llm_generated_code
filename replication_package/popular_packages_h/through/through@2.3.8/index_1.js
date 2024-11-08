const { Stream } = require('stream');

module.exports = function through(write, end, opts) {
  write = write || function (data) { this.queue(data); };
  end = end || function () { this.queue(null); };

  let ended = false, destroyed = false;
  const buffer = [];
  let _ended = false;
  const stream = new Stream();

  stream.readable = stream.writable = true;
  stream.paused = false;
  stream.autoDestroy = !(opts && opts.autoDestroy === false);

  stream.write = function (data) {
    write.call(this, data);
    return !stream.paused;
  };

  function drain() {
    while (buffer.length && !stream.paused) {
      const data = buffer.shift();
      if (data === null) {
        return stream.emit('end');
      } else {
        stream.emit('data', data);
      }
    }
  }

  stream.queue = stream.push = function (data) {
    if (_ended) return stream;
    if (data === null) _ended = true;
    buffer.push(data);
    drain();
    return stream;
  };

  stream.on('end', function () {
    stream.readable = false;
    if (!stream.writable && stream.autoDestroy) {
      process.nextTick(() => stream.destroy());
    }
  });

  function _end() {
    stream.writable = false;
    end.call(stream);
    if (!stream.readable && stream.autoDestroy) {
      stream.destroy();
    }
  }

  stream.end = function (data) {
    if (ended) return;
    ended = true;
    if (arguments.length) this.write(data);
    _end();
    return stream;
  };

  stream.destroy = function () {
    if (destroyed) return;
    destroyed = true;
    ended = true;
    buffer.length = 0;
    stream.writable = stream.readable = false;
    stream.emit('close');
    return stream;
  };

  stream.pause = function () {
    if (stream.paused) return;
    stream.paused = true;
    return stream;
  };

  stream.resume = function () {
    if (stream.paused) {
      stream.paused = false;
      stream.emit('resume');
    }
    drain();
    if (!stream.paused) {
      stream.emit('drain');
    }
    return stream;
  };

  return stream;
};

// For access as 'through.through'
module.exports.through = module.exports;
