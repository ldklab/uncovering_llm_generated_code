'use strict'

const { Duplex } = require('readable-stream');
const { inherits } = require('util');
const BufferList = require('./BufferList');

class BufferListStream extends Duplex {
  constructor(callback) {
    super();
    
    if (typeof callback === 'function') {
      this._callback = callback;
      
      const piper = (err) => {
        if (this._callback) {
          this._callback(err);
          this._callback = null;
        }
      };

      this.on('pipe', (src) => src.on('error', piper));
      this.on('unpipe', (src) => src.removeListener('error', piper));
    }

    BufferList._init.call(this, null);
  }

  _new(callback) {
    return new BufferListStream(callback);
  }

  _write(buf, encoding, callback) {
    this._appendBuffer(buf);
    if (typeof callback === 'function') callback();
  }

  _read(size) {
    if (!this.length) {
      this.push(null);
      return;
    }
    
    size = Math.min(size, this.length);
    this.push(this.slice(0, size));
    this.consume(size);
  }

  end(chunk) {
    super.end(chunk);
    if (this._callback) {
      this._callback(null, this.slice());
      this._callback = null;
    }
  }

  _destroy(err, cb) {
    this._bufs.length = 0;
    this.length = 0;
    cb(err);
  }

  _isBufferList(b) {
    return b instanceof BufferListStream || b instanceof BufferList || BufferListStream.isBufferList(b);
  }

  static isBufferList = BufferList.isBufferList;
}

module.exports = BufferListStream;
module.exports.BufferListStream = BufferListStream;
module.exports.BufferList = BufferList;
