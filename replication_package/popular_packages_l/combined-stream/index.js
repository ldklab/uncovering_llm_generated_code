const Stream = require('stream');
const fs = require('fs');

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
  
  append(stream) {
    if (typeof stream === 'function') {
      this._streams.push(stream);
    } else {
      this._streams.push(() => stream);
    }
    if (this.pauseStreams) {
      stream.pause();
    }
    return this;
  }
  
  _getNextStream() {
    if (this._streams.length === 0) {
      this.emit('end');
      this.writable = false;
      return;
    }
    
    const streamFactory = this._streams.shift();
    streamFactory((stream) => {
      stream.on('data', this._onData.bind(this));
      stream.on('end', this._onEnd.bind(this));
      stream.on('error', this.emit.bind(this, 'error'));
      
      this._currentStream = stream;
      
      if (!this.pauseStreams) {
        stream.resume();
      }
    });
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
  
  pipe(dest, options) {
    super.pipe(dest, options);
    this.resume();
    return dest;
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
    this.emit('end');
    this.writable = false;
    this.readable = false;
    this._streams = [];
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
// var CombinedStream = require('./combined-stream');
// var fs = require('fs');

// var combinedStream = CombinedStream.create();
// combinedStream.append(fs.createReadStream('file1.txt'));
// combinedStream.append(fs.createReadStream('file2.txt'));

// combinedStream.pipe(fs.createWriteStream('combined.txt'));
