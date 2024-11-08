const { Stream } = require('stream');

class CombinedStream extends Stream {
  constructor({ maxDataSize = 2 * 1024 * 1024, pauseStreams = true } = {}) {
    super();
    this.pauseStreams = pauseStreams;
    this.maxDataSize = maxDataSize;
    this.dataSize = 0;
    this._streams = [];
    this._currentStream = null;
    this.writable = true;
    this.readable = true;
  }

  append(stream) {
    const streamFn = typeof stream === 'function' ? stream : () => stream;
    this._streams.push(streamFn);
    if (this.pauseStreams && stream.pause) stream.pause();
    return this;
  }

  _getNextStream() {
    if (!this._streams.length) {
      this.emit('end');
      this.writable = false;
      return;
    }

    const streamFactory = this._streams.shift();
    streamFactory((stream) => {
      this._currentStream = stream;
      stream.on('data', this._onData.bind(this));
      stream.on('end', this._onEnd.bind(this));
      stream.on('error', (error) => this.emit('error', error));

      if (!this.pauseStreams && stream.resume) stream.resume();
    });
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

  pipe(dest, options) {
    super.pipe(dest, options);
    this.resume();
    return dest;
  }

  resume() {
    if (this._currentStream?.resume) this._currentStream.resume();
    else this._getNextStream();
    this.emit('resume');
  }

  pause() {
    if (this._currentStream?.pause) this._currentStream.pause();
    this.emit('pause');
  }

  end() {
    this.emit('end');
    this.writable = false;
    this.readable = false;
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
