const { Stream } = require('stream');

function through(write, end, opts) {
  write = write || function (data) { this.queue(data); };
  end = end || function () { this.queue(null); };
  
  const stream = new Stream();
  stream.readable = true;
  stream.writable = true;
  stream.paused = false;
  
  stream.write = function (data) {
    write.call(this, data);

    return !stream.paused;
  };

  stream.queue = function (data) {
    if (data === null) {
      return stream.emit('end');
    } else {
      return stream.emit('data', data);
    }
  };

  stream.end = function (data) {
    if (arguments.length) stream.write(data);
    end.call(stream);
    return stream;
  };

  stream.pause = function () {
    if (!stream.paused) {
      stream.paused = true;
      stream.emit('pause');
    }
  };

  stream.resume = function () {
    if (stream.paused) {
      stream.paused = false;
      stream.emit('resume');
    }
  };

  stream.autoDestroy = !(opts && opts.autoDestroy === false);

  if (stream.autoDestroy) {
    stream.on('end', function () {
      process.nextTick(function () {
        if (stream.readable && stream.writable) {
          stream.readable = stream.writable = false;
          stream.emit('close');
        }
      });
    });
  }

  return stream;
}

module.exports = through;
