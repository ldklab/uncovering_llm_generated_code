const { Stream } = require('stream');
const util = require('util');
const DelayedStream = require('delayed-stream');

class CombinedStream extends Stream {
  constructor() {
    super();
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

  static create(options = {}) {
    const combinedStream = new this();
    Object.assign(combinedStream, options);
    return combinedStream;
  }

  static isStreamLike(stream) {
    return !(typeof stream === 'function' || typeof stream === 'string' || typeof stream === 'boolean' || typeof stream === 'number' || Buffer.isBuffer(stream));
  }

  append(stream) {
    if (CombinedStream.isStreamLike(stream)) {
      if (!(stream instanceof DelayedStream)) {
        const delayedStream = DelayedStream.create(stream, { maxDataSize: Infinity, pauseStream: this.pauseStreams });
        stream.on('data', this._checkDataSize.bind(this));
        stream = delayedStream;
      }
      this._handleErrors(stream);
      if (this.pauseStreams) {
        stream.pause();
      }
    }
    this._streams.push(stream);
    return this;
  }

  pipe(dest, options) {
    super.pipe(dest, options);
    this.resume();
    return dest;
  }

  _getNext() {
    this._currentStream = null;
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
  }

  _realGetNext() {
    const stream = this._streams.shift();
    if (typeof stream === 'undefined') {
      this.end();
      return;
    }

    if (typeof stream !== 'function') {
      this._pipeNext(stream);
      return;
    }

    stream((newStream) => {
      if (CombinedStream.isStreamLike(newStream)) {
        newStream.on('data', this._checkDataSize.bind(this));
        this._handleErrors(newStream);
      }
      this._pipeNext(newStream);
    });
  }

  _pipeNext(stream) {
    this._currentStream = stream;
    if (CombinedStream.isStreamLike(stream)) {
      stream.on('end', this._getNext.bind(this));
      stream.pipe(this, { end: false });
    } else {
      this.write(stream);
      this._getNext();
    }
  }

  _handleErrors(stream) {
    stream.on('error', (err) => this._emitError(err));
  }

  write(data) {
    this.emit('data', data);
  }

  pause() {
    if (this.pauseStreams && this._currentStream?.pause) {
      this._currentStream.pause();
    }
    this.emit('pause');
  }

  resume() {
    if (!this._released) {
      this._released = true;
      this.writable = true;
      this._getNext();
    }
    if (this.pauseStreams && this._currentStream?.resume) {
      this._currentStream.resume();
    }
    this.emit('resume');
  }

  end() {
    this._reset();
    this.emit('end');
  }

  destroy() {
    this._reset();
    this.emit('close');
  }

  _reset() {
    this.writable = false;
    this._streams.length = 0;
    this._currentStream = null;
  }

  _checkDataSize() {
    this._updateDataSize();
    if (this.dataSize > this.maxDataSize) {
      const message = `DelayedStream#maxDataSize of ${this.maxDataSize} bytes exceeded.`;
      this._emitError(new Error(message));
    }
  }

  _updateDataSize() {
    this.dataSize = this._streams.reduce((total, stream) => total + (stream.dataSize || 0), 0);
    if (this._currentStream?.dataSize) {
      this.dataSize += this._currentStream.dataSize;
    }
  }

  _emitError(err) {
    this._reset();
    this.emit('error', err);
  }
}

module.exports = CombinedStream;
