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
    return !this.paused;
  };

  stream.queue = function (data) {
    if (data === null) {
      this.emit('end');
    } else {
      this.emit('data', data);
    }
    return this;
  };

  stream.end = function (data) {
    if (arguments.length) {
      this.write(data);
    }
    end.call(this);
    return this;
  };

  stream.pause = function () {
    if (!this.paused) {
      this.paused = true;
      this.emit('pause');
    }
    return this;
  };

  stream.resume = function () {
    if (this.paused) {
      this.paused = false;
      this.emit('resume');
    }
    return this;
  };

  stream.autoDestroy = !(opts && opts.autoDestroy === false);

  if (stream.autoDestroy) {
    stream.on('end', function () {
      process.nextTick(() => {
        if (stream.readable && stream.writable) {
          stream.readable = false;
          stream.writable = false;
          stream.emit('close');
        }
      });
    });
  }

  return stream;
}

module.exports = through;
