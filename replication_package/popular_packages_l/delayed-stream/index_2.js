const { Stream } = require('stream');

class DelayedStream extends Stream {
  constructor(source, options = {}) {
    super();
    this.source = source;
    this.paused = true;
    this.bufferedEvents = [];
    this.dataSize = 0;
    this.maxDataSize = options.maxDataSize || 1024 * 1024; // Default to 1MB
    this.pauseStream = options.pauseStream !== undefined ? options.pauseStream : true;
    
    if (this.pauseStream) {
      source.pause();
    }
    
    this._setupEventHandlers();
  }

  static create(source, options) {
    return new DelayedStream(source, options);
  }

  _setupEventHandlers() {
    this.source.on('data', (data) => this._handleDataEvent(data));
    this.source.on('end', () => this._bufferEvent('end'));
    this.source.on('error', (err) => this._bufferEvent('error', err));
    this.source.on('close', () => this._bufferEvent('close'));

    // Catch any errors to prevent crashes before release
    this.source.on('error', () => {});
  }

  _handleDataEvent(data) {
    this.dataSize += data.length;
    if (this.dataSize > this.maxDataSize) {
      this.emit('error', new Error('Max data size exceeded'));
    } else {
      this._bufferEvent('data', data);
    }
  }

  _bufferEvent(event, ...args) {
    this.bufferedEvents.push([event, ...args]);
  }

  _releaseBufferedEvents() {
    this.bufferedEvents.forEach(([event, ...args]) => {
      this.emit(event, ...args);
    });
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
    return this.source.pipe(dest);
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
