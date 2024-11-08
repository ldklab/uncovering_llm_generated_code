const { Stream } = require('stream');

class CombinedStream extends Stream {
  constructor(options = {}) {
    super();
    this.pauseStreams = options.pauseStreams !== false;
    this.maxDataSize = options.maxDataSize || 2 * 1024 * 1024;
    this.dataSize = 0;
    this._streams = [];
    this._currentStream = null;
    this.writable = true;
    this.readable = true;
  }
  
  append(source) {
    const streamProvider = typeof source === 'function' ? source : () => source;
    this._streams.push(streamProvider);
    if (this.pauseStreams) {
      const stream = streamProvider();
      if (stream.pause) stream.pause();
    }
    return this;
  }
  
  _getNextStream() {
    if (this._streams.length === 0) {
      this.emit('end');
      this.writable = false;
      return;
    }
    
    const streamProvider = this._streams.shift();
    const stream = streamProvider();
    
    stream.on('data', data => this._onData(data));
    stream.on('end', () => this._onEnd());
    stream.on('error', error => this.emit('error', error));

    this._currentStream = stream;

    if (!this.pauseStreams && stream.resume) {
      stream.resume();
    }
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
  
  pipe(destination, options) {
    super.pipe(destination, options);
    this.resume();
    return destination;
  }
  
  resume() {
    if (!this._currentStream) {
      this._getNextStream();
    } else if (this._currentStream.resume) {
      this._currentStream.resume();
    }
    this.emit('resume');
  }
  
  pause() {
    if (this._currentStream && this._currentStream.pause) {
      this._currentStream.pause();
    }
    this.emit('pause');
  }
  
  end() {
    this.writable = false;
    this.readable = false;
    this._streams = [];
    this.emit('end');
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

// Usage Example
// const CombinedStream = require('./combined-stream');
// const fs = require('fs');

// const combinedStream = CombinedStream.create();
// combinedStream.append(fs.createReadStream('file1.txt'));
// combinedStream.append(fs.createReadStream('file2.txt'));

// combinedStream.pipe(fs.createWriteStream('combined.txt'));
