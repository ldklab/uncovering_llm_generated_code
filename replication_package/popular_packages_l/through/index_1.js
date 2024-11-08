const { Stream } = require('stream');

function through(writeFunction, endFunction, options) {
  const defaultWrite = function(data) { this.queue(data); };
  const defaultEnd = function() { this.queue(null); };
  
  const stream = new Stream();
  stream.readable = true;
  stream.writable = true;
  stream.paused = false;
  
  stream.write = function(data) {
    (writeFunction || defaultWrite).call(this, data);
    return !stream.paused;
  };

  stream.queue = function(data) {
    if (data === null) {
      return stream.emit('end');
    }
    return stream.emit('data', data);
  };

  stream.end = function(data) {
    if (arguments.length) this.write(data);
    (endFunction || defaultEnd).call(this);
    return this;
  };

  stream.pause = function() {
    if (!this.paused) {
      this.paused = true;
      this.emit('pause');
    }
  };

  stream.resume = function() {
    if (this.paused) {
      this.paused = false;
      this.emit('resume');
    }
  };

  stream.autoDestroy = !(options && options.autoDestroy === false);

  if (stream.autoDestroy) {
    stream.on('end', function() {
      process.nextTick(() => {
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
