const { Stream } = require('stream');

class DelayedStream extends Stream {
  constructor(source, options = {}) {
    super();
    this.source = source;
    this.paused = false;
    this.bufferedEvents = [];
    this.dataSize = 0;
    this.maxDataSize = options.maxDataSize || 1024 * 1024; // 1MB default
    this.pauseStream = options.hasOwnProperty('pauseStream') ? options.pauseStream : true;
    
    if (this.pauseStream) {
      source.pause();
    }
    
    source.on('data', this._onData.bind(this));
    source.on('end', this._onEnd.bind(this));
    source.on('error', this._onError.bind(this));
    source.on('close', this._onClose.bind(this));
    
    // No-op error handler to avoid crashing if source emits an error before release
    source.on('error', () => {});
  }

  static create(source, options) {
    return new DelayedStream(source, options);
  }

  _onData(data) {
    this.dataSize += data.length;
    if (this.dataSize > this.maxDataSize) {
      this.emit('error', new Error('Max data size exceeded'));
    } else {
      this.bufferedEvents.push(['data', data]);
    }
  }

  _onEnd() {
    this.bufferedEvents.push(['end']);
  }

  _onError(err) {
    this.bufferedEvents.push(['error', err]);
  }

  _onClose() {
    this.bufferedEvents.push(['close']);
  }

  _releaseBufferedEvents() {
    for (const [event, ...args] of this.bufferedEvents) {
      this.emit(event, ...args);
    }
    this.bufferedEvents = [];
  }

  resume() {
    if (!this.released) {
      this.release();
    }
    this.source.resume();
  }

  pause() {
    this.source.pause();
  }

  pipe(dest) {
    this.resume();
    this.source.pipe(dest);
  }

  release() {
    this.released = true;
    this._releaseBufferedEvents();
  }

  get readable() {
    return this.source.readable;
  }
}

module.exports = DelayedStream;
