const { Stream } = require('stream');
const util = require('util');

function DelayedStream() {
  Stream.call(this);
  this.source = null;
  this.dataSize = 0;
  this.maxDataSize = 1024 * 1024;
  this.pauseStream = true;
  this._maxDataSizeExceeded = false;
  this._released = false;
  this._bufferedEvents = [];
}

util.inherits(DelayedStream, Stream);

DelayedStream.create = function(source, options = {}) {
  const delayedStream = new this();
  Object.assign(delayedStream, options);
  delayedStream.source = source;

  const realEmit = source.emit;
  source.emit = function() {
    delayedStream._handleEmit(arguments);
    return realEmit.apply(source, arguments);
  };

  source.on('error', () => {});
  if (delayedStream.pauseStream) {
    source.pause();
  }

  return delayedStream;
};

Object.defineProperty(DelayedStream.prototype, 'readable', {
  configurable: true,
  enumerable: true,
  get() {
    return this.source.readable;
  }
});

DelayedStream.prototype.setEncoding = function(...args) {
  return this.source.setEncoding(...args);
};

DelayedStream.prototype.resume = function() {
  if (!this._released) {
    this.release();
  }
  this.source.resume();
};

DelayedStream.prototype.pause = function() {
  this.source.pause();
};

DelayedStream.prototype.release = function() {
  this._released = true;
  this._bufferedEvents.forEach((args) => {
    this.emit(...args);
  });
  this._bufferedEvents = [];
};

DelayedStream.prototype.pipe = function(...args) {
  const result = Stream.prototype.pipe.apply(this, args);
  this.resume();
  return result;
};

DelayedStream.prototype._handleEmit = function(args) {
  if (this._released) {
    this.emit(...args);
    return;
  }

  if (args[0] === 'data') {
    this.dataSize += args[1].length;
    this._checkIfMaxDataSizeExceeded();
  }

  this._bufferedEvents.push(args);
};

DelayedStream.prototype._checkIfMaxDataSizeExceeded = function() {
  if (this._maxDataSizeExceeded) {
    return;
  }

  if (this.dataSize > this.maxDataSize) {
    this._maxDataSizeExceeded = true;
    const message = `DelayedStream#maxDataSize of ${this.maxDataSize} bytes exceeded.`;
    this.emit('error', new Error(message));
  }
};

module.exports = DelayedStream;
