'use strict';

const { Duplex } = require('readable-stream');
const inherits = require('inherits');
const BufferList = require('./BufferList');

// BufferListStream class definition
function BufferListStream(callback) {
  if (!(this instanceof BufferListStream)) {
    return new BufferListStream(callback);
  }

  if (typeof callback === 'function') {
    this._callback = callback;
    const piper = (err) => {
      if (this._callback) {
        this._callback(err);
        this._callback = null;
      }
    };

    this.on('pipe', (src) => {
      src.on('error', piper);
    });

    this.on('unpipe', (src) => {
      src.removeListener('error', piper);
    });

    callback = null;
  }

  // Initialize BufferList and DuplexStream
  BufferList._init.call(this, callback);
  Duplex.call(this);
}

// Inherit from Duplex
inherits(BufferListStream, Duplex);

// Mix in methods from BufferList prototype
Object.assign(BufferListStream.prototype, BufferList.prototype);

BufferListStream.prototype._new = function (callback) {
  return new BufferListStream(callback);
};

BufferListStream.prototype._write = function (buf, encoding, callback) {
  this._appendBuffer(buf);
  if (typeof callback === 'function') {
    callback();
  }
};

BufferListStream.prototype._read = function (size) {
  if (!this.length) {
    return this.push(null);
  }

  size = Math.min(size, this.length);
  this.push(this.slice(0, size));
  this.consume(size);
};

BufferListStream.prototype.end = function (chunk) {
  Duplex.prototype.end.call(this, chunk);

  if (this._callback) {
    this._callback(null, this.slice());
    this._callback = null;
  }
};

BufferListStream.prototype._destroy = function (err, cb) {
  this._bufs.length = 0;
  this.length = 0;
  cb(err);
};

BufferListStream.prototype._isBufferList = function (b) {
  return (
    b instanceof BufferListStream ||
    b instanceof BufferList ||
    BufferListStream.isBufferList(b)
  );
};

// Assign static method for type checking
BufferListStream.isBufferList = BufferList.isBufferList;

// Exports
module.exports = BufferListStream;
module.exports.BufferListStream = BufferListStream;
module.exports.BufferList = BufferList;
