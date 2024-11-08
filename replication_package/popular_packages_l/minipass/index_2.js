const { EventEmitter } = require('events');

class MiniStream extends EventEmitter {
  constructor(options = {}) {
    super();
    this.encoding = options.encoding || null;
    this.objectMode = Boolean(options.objectMode);
    this.async = Boolean(options.async);
    this.buffer = [];
    this.writable = true;
    this.readable = true;
    this.flowing = null;
    this.emittedEnd = false;
  }

  write(chunk, encoding, callback) {
    if (!this.writable) throw new Error('Stream is not writable');
    if (!this.objectMode && !(typeof chunk === 'string' || Buffer.isBuffer(chunk))) {
      throw new Error('Invalid chunk type');
    }
    if (this.encoding && typeof chunk === 'string') {
      chunk = Buffer.from(chunk, this.encoding);
    }
    this.buffer.push(chunk);
    if (this.flowing === null) this.flowing = true;
    if (this.flowing) this.processData();
    if (callback) callback();
    return this.flowing;
  }

  end(chunk, encoding, callback) {
    if (!this.writable) throw new Error('Stream is not writable');
    if (chunk) this.write(chunk, encoding);
    this.writable = false;
    if (callback) callback();
    if (this.buffer.length === 0) this.finalizeStream();
  }

  processData() {
    while (this.flowing && this.buffer.length > 0) {
      const piece = this.buffer.shift();
      this.emit('data', piece);
    }
    if (!this.emittedEnd && (this.buffer.length === 0 || !this.flowing)) this.finalizeStream();
  }

  finalizeStream() {
    if (this.emittedEnd) return;
    this.emittedEnd = true;
    this.readable = false;
    this.emit('end');
  }

  pipe(destination) {
    this.flowing = true;
    this.on('data', (chunk) => destination.write(chunk));
    this.on('end', () => destination.end());
    return destination;
  }

  resume() {
    if (!this.flowing) {
      this.flowing = true;
      this.processData();
    }
  }

  pause() {
    this.flowing = false;
  }
}

module.exports = { MiniStream };
