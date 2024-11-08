const { Stream } = require('stream');

class DelayedStream extends Stream {
  constructor(source, options = {}) {
    super();
    this.source = source;
    this.paused = false;
    this.bufferedEvents = [];
    this.dataSize = 0;
    this.maxDataSize = options.maxDataSize || 1024 * 1024; // Set maximum data size default to 1MB
    this.pauseStream = options.hasOwnProperty('pauseStream') ? options.pauseStream : true;
    
    // Pause underlying stream if pauseStream option is true
    if (this.pauseStream) {
      source.pause();
    }
    
    // Bind source events to internal handlers
    source.on('data', this._handleData.bind(this));
    source.on('end', this._handleEnd.bind(this));
    source.on('error', this._handleError.bind(this));
    source.on('close', this._handleClose.bind(this));
    
    // Prevent crashing on errors before release
    source.on('error', () => {});
  }

  static create(source, options) {
    return new DelayedStream(source, options);
  }

  _handleData(data) {
    this.dataSize += data.length;
    // Emit error if data size exceeds max limit, otherwise buffer the event
    if (this.dataSize > this.maxDataSize) {
      this.emit('error', new Error('Max data size exceeded'));
    } else {
      this.bufferedEvents.push(['data', data]);
    }
  }

  _handleEnd() {
    this.bufferedEvents.push(['end']);
  }

  _handleError(err) {
    this.bufferedEvents.push(['error', err]);
  }

  _handleClose() {
    this.bufferedEvents.push(['close']);
  }

  _releaseBufferedEvents() {
    // Emit all buffered events and clear the buffer
    for (const [event, ...args] of this.bufferedEvents) {
      this.emit(event, ...args);
    }
    this.bufferedEvents = [];
  }

  resume() {
    // Release buffered events if not yet released, and resume source
    if (!this.released) {
      this.release();
    }
    this.source.resume();
  }

  pause() {
    this.source.pause();
  }

  pipe(dest) {
    // Resume source and pipe to destination
    this.resume();
    this.source.pipe(dest);
  }

  release() {
    this.released = true;
    this._releaseBufferedEvents();
  }

  get readable() {
    // Proxies the readability of the original stream
    return this.source.readable;
  }
}

module.exports = DelayedStream;
