'use strict';

const { Duplex } = require('readable-stream');
const inherits = require('inherits');
const BufferList = require('./BufferList');

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

  BufferList._init.call(this, callback);
  Duplex.call(this);
}

inherits(BufferListStream, Duplex);
Object.assign(BufferListStream.prototype, BufferList.prototype);

BufferListStream.prototype._new = function (callback) {
  return new BufferListStream(callback);
};

BufferListStream.prototype._write = function (chunk, encoding, callback) {
  this._appendBuffer(chunk);
  if (typeof callback === 'function') callback();
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
  if (cb) cb(err);
};

BufferListStream.prototype._isBufferList = function (b) {
  return b instanceof BufferListStream || b instanceof BufferList || BufferListStream.isBufferList(b);
};

BufferListStream.isBufferList = BufferList.isBufferList;

module.exports = BufferListStream;
module.exports.BufferListStream = BufferListStream;
module.exports.BufferList = BufferList;
