const { Stream } = require('stream');
const util = require('util');
const DelayedStream = require('delayed-stream');

function CombinedStream() {
  if (!(this instanceof CombinedStream)) return new CombinedStream();

  Stream.call(this);

  this.writable = false;
  this.readable = true;
  this.dataSize = 0;
  this.maxDataSize = 2 * 1024 * 1024; // 2MB
  this.pauseStreams = true;

  this._released = false;
  this._streams = [];
  this._currentStream = null;
  this._insideLoop = false;
  this._pendingNext = false;
}

util.inherits(CombinedStream, Stream);

CombinedStream.create = function (options = {}) {
  const combinedStream = new CombinedStream();
  Object.assign(combinedStream, options);
  return combinedStream;
};

CombinedStream.isStreamLike = function (stream) {
  return typeof stream !== 'function'
    && typeof stream !== 'string'
    && typeof stream !== 'boolean'
    && typeof stream !== 'number'
    && !Buffer.isBuffer(stream);
};

CombinedStream.prototype.append = function (stream) {
  if (CombinedStream.isStreamLike(stream)) {
    if (!(stream instanceof DelayedStream)) {
      stream = DelayedStream.create(stream, {
        maxDataSize: Infinity,
        pauseStream: this.pauseStreams,
      });
    }
    stream.on('data', this._checkDataSize.bind(this));
    this._handleErrors(stream);
    if (this.pauseStreams) stream.pause();
  }

  this._streams.push(stream);
  return this;
};

CombinedStream.prototype.pipe = function (dest, options) {
  Stream.prototype.pipe.call(this, dest, options);
  this.resume();
  return dest;
};

CombinedStream.prototype._getNext = function () {
  if (this._insideLoop) {
    this._pendingNext = true;
    return;
  }

  this._insideLoop = true;
  try {
    do {
      this._pendingNext = false;
      this._realGetNext();
    } while (this._pendingNext);
  } finally {
    this._insideLoop = false;
  }
};

CombinedStream.prototype._realGetNext = function () {
  const stream = this._streams.shift();

  if (!stream) {
    this.end();
    return;
  }

  if (typeof stream !== 'function') {
    this._pipeNext(stream);
    return;
  }

  stream(getStream => {
    if (CombinedStream.isStreamLike(getStream)) {
      getStream.on('data', this._checkDataSize.bind(this));
      this._handleErrors(getStream);
    }
    this._pipeNext(getStream);
  });
};

CombinedStream.prototype._pipeNext = function (stream) {
  this._currentStream = stream;

  if (CombinedStream.isStreamLike(stream)) {
    stream.once('end', this._getNext.bind(this));
    stream.pipe(this, { end: false });
  } else {
    this.write(stream);
    this._getNext();
  }
};

CombinedStream.prototype._handleErrors = function (stream) {
  stream.on('error', err => this._emitError(err));
};

CombinedStream.prototype.write = function (data) {
  this.emit('data', data);
};

CombinedStream.prototype.pause = function () {
  if (this.pauseStreams && this._currentStream?.pause) {
    this._currentStream.pause();
  }
  this.emit('pause');
};

CombinedStream.prototype.resume = function () {
  if (!this._released) {
    this._released = true;
    this.writable = true;
    this._getNext();
  }

  if (this.pauseStreams && this._currentStream?.resume) {
    this._currentStream.resume();
  }
  this.emit('resume');
};

CombinedStream.prototype.end = function () {
  this._reset();
  this.emit('end');
};

CombinedStream.prototype.destroy = function () {
  this._reset();
  this.emit('close');
};

CombinedStream.prototype._reset = function () {
  this.writable = false;
  this._streams = [];
  this._currentStream = null;
};

CombinedStream.prototype._checkDataSize = function () {
  this._updateDataSize();
  if (this.dataSize > this.maxDataSize) {
    this._emitError(new Error(`DelayedStream#maxDataSize of ${this.maxDataSize} bytes exceeded.`));
  }
};

CombinedStream.prototype._updateDataSize = function () {
  this.dataSize = this._streams.reduce((acc, stream) => acc + (stream.dataSize || 0), 0);
  if (this._currentStream && this._currentStream.dataSize) {
    this.dataSize += this._currentStream.dataSize;
  }
};

CombinedStream.prototype._emitError = function (err) {
  this._reset();
  this.emit('error', err);
};

module.exports = CombinedStream;
