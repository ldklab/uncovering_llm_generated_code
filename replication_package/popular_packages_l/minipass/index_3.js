const { EventEmitter } = require('events');

class Minipass extends EventEmitter {
  constructor(options = {}) {
    super();
    const { encoding = null, objectMode = false, async = false } = options;
    this.encoding = encoding;
    this.objectMode = objectMode;
    this.async = async;
    this.buffer = [];
    this.writable = true;
    this.readable = true;
    this.flowing = null;
    this.emittedEnd = false;
  }

  write(chunk, encoding, cb) {
    if (!this.writable) throw new Error('Stream is not writable');
    if (!this.objectMode && typeof chunk !== 'string' && !Buffer.isBuffer(chunk)) {
      throw new Error('Invalid chunk type');
    }
    if (this.encoding && typeof chunk === 'string') {
      chunk = Buffer.from(chunk, this.encoding);
    }
    this.buffer.push(chunk);
    if (this.flowing === null) this.flowing = true;
    if (this.flowing) this.emitData();
    if (cb) cb();
    return this.flowing;
  }

  end(chunk, encoding, cb) {
    if (!this.writable) throw new Error('Stream is not writable');
    if (chunk) this.write(chunk, encoding);
    this.writable = false;
    if (cb) cb();
    if (this.buffer.length === 0) this.emitEnd();
  }

  emitData() {
    while (this.flowing && this.buffer.length > 0) {
      const chunk = this.buffer.shift();
      this.emit('data', chunk);
    }
    if (!this.emittedEnd && this.buffer.length === 0) this.emitEnd();
  }

  emitEnd() {
    if (this.emittedEnd) return;
    this.emittedEnd = true;
    this.readable = false;
    this.emit('end');
  }

  pipe(dest) {
    this.flowing = true;
    this.on('data', chunk => dest.write(chunk));
    this.on('end', () => dest.end());
    return dest;
  }

  resume() {
    if (!this.flowing) {
      this.flowing = true;
      this.emitData();
    }
  }

  pause() {
    this.flowing = false;
  }
}

module.exports = { Minipass };
