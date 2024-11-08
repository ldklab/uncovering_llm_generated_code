const DuplexStream = require('readable-stream/duplex');
const { Buffer } = require('safe-buffer');
const util = require('util');

class BufferList extends DuplexStream {
  constructor(callback) {
    super();
    this._bufs = [];
    this.length = 0;

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
    } else {
      this.append(callback);
    }
  }

  _offset(offset) {
    let tot = 0;
    let i = 0;
    
    if (offset === 0) return [0, 0];
    
    for (; i < this._bufs.length; i++) {
      const _t = tot + this._bufs[i].length;
      if (offset < _t || i === this._bufs.length - 1) return [i, offset - tot];
      tot = _t;
    }
  }

  append(buf) {
    if (Buffer.isBuffer(buf)) {
      this._appendBuffer(buf);
    } else if (Array.isArray(buf)) {
      buf.forEach(item => this.append(item));
    } else if (buf instanceof BufferList) {
      buf._bufs.forEach(item => this.append(item));
    } else if (buf !== null) {
      if (typeof buf === 'number') buf = buf.toString();
      this._appendBuffer(Buffer.from(buf));
    }
    return this;
  }

  _appendBuffer(buf) {
    this._bufs.push(buf);
    this.length += buf.length;
  }

  _write(buf, encoding, callback) {
    this._appendBuffer(buf);
    if (typeof callback === 'function') callback();
  }

  _read(size) {
    if (!this.length) return this.push(null);
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

  get(index) {
    return this.slice(index, index + 1)[0];
  }

  slice(start, end) {
    if (typeof start === 'number' && start < 0) start += this.length;
    if (typeof end === 'number' && end < 0) end += this.length;
    return this.copy(null, 0, start, end);
  }

  copy(dst, dstStart, srcStart, srcEnd) {
    if (typeof srcStart !== 'number' || srcStart < 0) srcStart = 0;
    if (typeof srcEnd !== 'number' || srcEnd > this.length) srcEnd = this.length;
    if (srcStart >= this.length) return dst || Buffer.alloc(0);
    if (srcEnd <= 0) return dst || Buffer.alloc(0);

    const copy = !!dst;
    const off = this._offset(srcStart);
    const len = srcEnd - srcStart;
    let bytes = len;
    let bufoff = (copy && dstStart) || 0;
    let start = off[1];
    let l, i;

    if (srcStart === 0 && srcEnd === this.length) {
      if (!copy) {
        return this._bufs.length === 1 ? this._bufs[0] : Buffer.concat(this._bufs, this.length);
      }

      for (i = 0; i < this._bufs.length; i++) {
        this._bufs[i].copy(dst, bufoff);
        bufoff += this._bufs[i].length;
      }

      return dst;
    }

    if (bytes <= this._bufs[off[0]].length - start) {
      return copy ? this._bufs[off[0]].copy(dst, dstStart, start, start + bytes) : this._bufs[off[0]].slice(start, start + bytes);
    }

    if (!copy) dst = Buffer.allocUnsafe(len);

    for (i = off[0]; i < this._bufs.length; i++) {
      l = this._bufs[i].length - start;

      if (bytes > l) {
        this._bufs[i].copy(dst, bufoff, start);
        bufoff += l;
      } else {
        this._bufs[i].copy(dst, bufoff, start, start + bytes);
        bufoff += l;
        break;
      }

      bytes -= l;

      if (start) start = 0;
    }

    if (dst.length > bufoff) return dst.slice(0, bufoff);

    return dst;
  }

  shallowSlice(start, end) {
    start = start || 0;
    end = end || this.length;

    if (start < 0) start += this.length;
    if (end < 0) end += this.length;

    const startOffset = this._offset(start);
    const endOffset = this._offset(end);
    const buffers = this._bufs.slice(startOffset[0], endOffset[0] + 1);

    if (endOffset[1] === 0) buffers.pop();
    else buffers[buffers.length - 1] = buffers[buffers.length - 1].slice(0, endOffset[1]);

    if (startOffset[1] !== 0) buffers[0] = buffers[0].slice(startOffset[1]);

    return new BufferList(buffers);
  }

  toString(encoding, start, end) {
    return this.slice(start, end).toString(encoding);
  }

  consume(bytes) {
    bytes = Math.trunc(bytes);
    if (Number.isNaN(bytes) || bytes <= 0) return this;

    while (this._bufs.length) {
      if (bytes >= this._bufs[0].length) {
        bytes -= this._bufs[0].length;
        this.length -= this._bufs[0].length;
        this._bufs.shift();
      } else {
        this._bufs[0] = this._bufs[0].slice(bytes);
        this.length -= bytes;
        break;
      }
    }
    return this;
  }

  duplicate() {
    const copy = new BufferList();
    this._bufs.forEach(buffer => copy.append(buffer));
    return copy;
  }

  destroy() {
    this._bufs.length = 0;
    this.length = 0;
    this.push(null);
  }
}

['readDoubleBE', 'readDoubleLE', 'readFloatBE', 'readFloatLE', 'readInt32BE', 'readInt32LE', 'readUInt32BE', 'readUInt32LE', 'readInt16BE', 'readInt16LE', 'readUInt16BE', 'readUInt16LE', 'readInt8', 'readUInt8'].forEach(method => {
  BufferList.prototype[method] = function (offset) {
    return this.slice(offset, offset + Buffer[method].BYTES_PER_ELEMENT)[method](0);
  };
});

module.exports = BufferList;
