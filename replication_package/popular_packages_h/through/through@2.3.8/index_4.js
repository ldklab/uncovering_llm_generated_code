const { Stream } = require('stream');

// through stream - re-emits input data
module.exports = through;
through.through = through;

function through(write, end, opts = {}) {
  const stream = new Stream();
  const buffer = [];
  let ended = false, destroyed = false, _ended = false;

  stream.readable = stream.writable = true;
  stream.paused = false;
  stream.autoDestroy = opts.autoDestroy !== false;

  stream.write = function (data) {
    if (!ended) {
      (write || function (d) { this.queue(d); }).call(this, data);
    }
    return !stream.paused;
  };

  function drain() {
    while (buffer.length && !stream.paused) {
      const data = buffer.shift();
      if (data === null) {
        stream.emit('end');
        break;
      }
      stream.emit('data', data);
    }
  }

  stream.queue = stream.push = function (data) {
    if (_ended) return stream;
    if (data === null) _ended = true;
    buffer.push(data);
    drain();
    return stream;
  };

  stream.end = function (data) {
    if (ended) return;
    ended = true;
    if (arguments.length) stream.write(data);
    stream.writable = false;
    (end || function () { this.queue(null); }).call(this);
    if (!stream.readable && stream.autoDestroy) stream.destroy();
    return stream;
  };

  stream.destroy = function () {
    if (destroyed) return;
    destroyed = true;
    buffer.length = 0;
    stream.writable = stream.readable = false;
    stream.emit('close');
    return stream;
  };

  stream.pause = function () {
    stream.paused = true;
    return stream;
  };

  stream.resume = function () {
    if (stream.paused) {
      stream.paused = false;
      stream.emit('resume');
      drain();
      if (!stream.paused) stream.emit('drain');
    }
    return stream;
  };

  stream.on('end', function () {
    stream.readable = false;
    if (!stream.writable && stream.autoDestroy) {
      process.nextTick(() => stream.destroy());
    }
  });

  return stream;
}
