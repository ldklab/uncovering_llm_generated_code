const { PassThrough } = require('stream');

class MergedStream extends PassThrough {
  constructor(options) {
    super(options);
    this.options = options || {};
    this.pendingStreams = [];
    this.activeStreams = 0;
    this.ended = false;
  }
  
  add(...streams) {
    streams.flat().forEach(stream => {
      this._addStream(stream);
    });
    if (!this.activeStreams && !this.pendingStreams.length) this.emit('queueDrain');
    return this;
  }
  
  _addStream(stream) {
    if (this.ended) throw new Error('Cannot add stream after end');
    this.activeStreams++;
    stream.on('end', () => this._onEnd());
    if (this.options.pipeError) {
      stream.on('error', err => this.emit('error', err));
    }
    stream.pipe(this, { end: false });
  }
  
  _onEnd() {
    this.activeStreams--;
    if (!this.activeStreams && !this.pendingStreams.length) {
      this.ended = true;
      if (this.options.end !== false) this.end();
      this.emit('queueDrain');
    }
  }
}

function merge2(...args) {
  const options = (typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1]) && !(args[args.length - 1] instanceof PassThrough)) ? args.pop() : {};
  const mergedStream = new MergedStream(options);
  mergedStream.add(...args);
  return mergedStream;
}

module.exports = merge2;
```