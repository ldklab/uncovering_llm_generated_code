const { Stream } = require('stream');

class CombinedStream extends Stream {
  constructor(options = {}) {
    super();
    this.pauseStreams = options.pauseStreams !== false;
    this.maxDataSize = options.maxDataSize || 2 * 1024 * 1024; // 2 MB default
    this.dataSize = 0;
    this._streams = [];
    this._currentStream = null;
  }

  append(stream) {
    if (typeof stream === 'function') {
      this._streams.push(stream);
    } else {
      this._streams.push(() => stream);
      if (this.pauseStreams) stream.pause();
    }
    return this;
  }

  _getNextStream() {
    if (this._streams.length === 0) {
      this._finalizeStream();
      return;
    }

    const streamFactory = this._streams.shift();
    const nextStream = streamFactory();
    nextStream.on('data', this._onData.bind(this));
    nextStream.on('end', this._onEnd.bind(this));
    nextStream.on('error', (err) => this.emit('error', err));

    this._currentStream = nextStream;
    if (!this.pauseStreams) nextStream.resume();
  }

  _onData(data) {
    this.dataSize += data.length;
    if (this.dataSize > this.maxDataSize) {
      this.emit('error', new Error('maxDataSize exceeded'));
      return;
    }
    this.emit('data', data);
  }

  _onEnd() {
    this._getNextStream();
  }

  pipe(destination, options) {
    super.pipe(destination, options);
    if (!this._currentStream) this._getNextStream();
    return destination;
  }

  resume() {
    if (this._currentStream && typeof this._currentStream.resume === 'function') {
      this._currentStream.resume();
    }
    this.emit('resume');
  }

  pause() {
    if (this._currentStream && typeof this._currentStream.pause === 'function') {
      this._currentStream.pause();
    }
    this.emit('pause');
  }

  _finalizeStream() {
    this.emit('end');
    this.writable = false;
    this.readable = false;
  }

  end() {
    this._finalizeStream();
    this._streams = [];
  }

  destroy() {
    this.end();
    this.emit('close');
  }

  static create(options) {
    return new CombinedStream(options);
  }
}

module.exports = CombinedStream;

// Usage Example
// const fs = require('fs');
// const CombinedStream = require('./combined-stream');

// const combinedStream = CombinedStream.create();
// combinedStream.append(() => fs.createReadStream('file1.txt'));
// combinedStream.append(() => fs.createReadStream('file2.txt'));

// combinedStream.pipe(fs.createWriteStream('combined.txt'));
