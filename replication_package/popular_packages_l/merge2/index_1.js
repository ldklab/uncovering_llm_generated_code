const { PassThrough } = require('stream');

class CombinedStream extends PassThrough {
  constructor(options) {
    super(options);
    this.streamOptions = options || {};
    this.streamsQueue = [];
    this.activeStreamCount = 0;
    this.isFinalized = false;
  }
  
  includeStreams(...streams) {
    streams.forEach(stream => {
      if (Array.isArray(stream)) {
        stream.forEach(singleStream => this._integrateStream(singleStream));
      } else {
        this._integrateStream(stream);
      }
    });
    if (!this.activeStreamCount && !this.streamsQueue.length) this.emit('streamsExhausted');
    return this;
  }
  
  _integrateStream(streamInput) {
    if (this.isFinalized) throw new Error('Cannot integrate stream after completion');
    this.activeStreamCount++;
    streamInput.on('end', this._finalizeStream.bind(this));
    if (this.streamOptions.captureError) {
      streamInput.on('error', error => this.emit('error', error));
    }
    streamInput.pipe(this, { end: false });
  }
  
  _finalizeStream() {
    this.activeStreamCount--;
    if (!this.activeStreamCount && !this.streamsQueue.length) {
      this.isFinalized = true;
      if (this.streamOptions.end !== false) this.end();
      this.emit('streamsExhausted');
    }
  }
}

function amalgamateStreams(...streamArguments) {
  const lastItem = streamArguments[streamArguments.length - 1];
  const configOptions = (typeof lastItem === 'object' && !Array.isArray(lastItem) && lastItem instanceof PassThrough === false) ? streamArguments.pop() : {};
  const combinedStream = new CombinedStream(configOptions);
  combinedStream.includeStreams(...streamArguments);
  return combinedStream;
}

module.exports = amalgamateStreams;
```