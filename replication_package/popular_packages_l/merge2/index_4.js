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
    streams.forEach(stream => {
      if (Array.isArray(stream)) {
        stream.forEach(singleStream => this._addSingleStream(singleStream));
      } else {
        this._addSingleStream(stream);
      }
    });
    if (!this.activeStreams && !this.pendingStreams.length) {
      this.emit('queueDrain');
    }
    return this;
  }
  
  _addSingleStream(stream) {
    if (this.ended) throw new Error('Cannot add stream after end');
    this.activeStreams++;
    stream.on('end', () => this._onStreamEnd());
    if (this.options.pipeError) {
      stream.on('error', error => this.emit('error', error));
    }
    stream.pipe(this, { end: false });
  }
  
  _onStreamEnd() {
    this.activeStreams--;
    if (!this.activeStreams && !this.pendingStreams.length) {
      this.ended = true;
      if (this.options.end !== false) this.end();
      this.emit('queueDrain');
    }
  }
}

function merge2(...streamsOrOptions) {
  const potentialOptions = streamsOrOptions[streamsOrOptions.length - 1];
  const options = (typeof potentialOptions === 'object' && !Array.isArray(potentialOptions) && !(potentialOptions instanceof PassThrough))
    ? streamsOrOptions.pop() : {};
  const mergedStream = new MergedStream(options);
  mergedStream.add(...streamsOrOptions);
  return mergedStream;
}

module.exports = merge2;
```