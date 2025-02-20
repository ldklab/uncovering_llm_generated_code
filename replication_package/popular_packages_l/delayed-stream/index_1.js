const { Stream } = require('stream');

class DelayedStream extends Stream {
  constructor(source, options = {}) {
    super();
    this.source = source;
    this.paused = false;
    this.bufferedEvents = [];
    this.dataSize = 0;
    this.maxDataSize = options.maxDataSize || 1024 * 1024; // Default to 1MB
    this.pauseStream = options.pauseStream !== undefined ? options.pauseStream : true;

    if (this.pauseStream) {
      this.source.pause();
    }

    // Bind event handlers
    this.source.on('data', this._onData.bind(this));
    this.source.on('end', this._onEnd.bind(this));
    this.source.on('error', this._onError.bind(this));
    this.source.on('close', this._onClose.bind(this));

    // Prevent unhandled error exceptions by adding a no-op error handler
    this.source.on('error', () => {});
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
