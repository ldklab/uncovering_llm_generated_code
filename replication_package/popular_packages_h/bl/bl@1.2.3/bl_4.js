const { Duplex } = require('readable-stream');
const { Buffer } = require('safe-buffer');

class BufferList extends Duplex {
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

      this.on('pipe', (src) => {
        src.on('error', piper);
      });
      
      this.on('unpipe', (src) => {
        src.removeListener('error', piper);
      });
    } else {
      this.append(callback);
    }
  }

  _offset(offset) {
    let total = 0;
    for (let i = 0; i < this._bufs.length; i++) {
      const nextTotal = total + this._bufs[i].length;
      if (offset < nextTotal || i === this._bufs.length - 1) {
        return [i, offset - total];
      }
      total = nextTotal;
    }
    return [0, 0];
  }

  append(buf) {
    if (Buffer.isBuffer(buf)) {
      this._appendBuffer(buf);
    } else if (Array.isArray(buf)) {
      buf.forEach((b) => this.append(b));
    } else if (buf instanceof BufferList) {
      buf._bufs.forEach((b) => this.append(b));
    } else if (buf != null) {
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
    if (start < 0) start += this.length;
    if (end < 0) end += this.length;
    return this.copy(null, 0, start, end);
  }

  copy(dst, dstStart, srcStart = 0, srcEnd = this.length) {
    if (srcStart >= this.length) return dst || Buffer.alloc(0);
    if (srcEnd <= 0) return dst || Buffer.alloc(0);

    const copy = !!dst;
    const [bufferIndex, bufferOffset] = this._offset(srcStart);
    const len = srcEnd - srcStart;

    if (srcStart === 0 && srcEnd === this.length) {
      if (!copy) {
        return this._bufs.length === 1 ? this._bufs[0] : Buffer.concat(this._bufs, this.length);
      }

      let bufOffset = dstStart || 0;
      for (let i = 0; i < this._bufs.length; i++) {
        this._bufs[i].copy(dst, bufOffset);
        bufOffset += this._bufs[i].length;
      }
      return dst;
    }

    if (!copy) dst = Buffer.allocUnsafe(len);
    let bytes = len;
    let bufoff = dstStart || 0;
    let start = bufferOffset;

    for (let i = bufferIndex; i < this._bufs.length && bytes > 0; i++) {
      const bufLen = this._bufs[i].length - start;
      const copyLen = Math.min(bytes, bufLen);
      
      this._bufs[i].copy(dst, bufoff, start, start + copyLen);
      bufoff += copyLen;
      bytes -= copyLen;
      start = 0;
    }

    return copy ? dst.slice(0, bufoff) : dst;
  }

  shallowSlice(start = 0, end = this.length) {
    start = start < 0 ? start + this.length : start;
    end = end < 0 ? end + this.length : end;

    const [startIdx, startOff] = this._offset(start);
    const [endIdx, endOff] = this._offset(end);

    const buffers = this._bufs.slice(startIdx, endIdx + 1);
    if (endOff === 0) buffers.pop();
    else buffers[buffers.length - 1] = buffers[buffers.length - 1].slice(0, endOff);

    if (startOff !== 0) buffers[0] = buffers[0].slice(startOff);
    
    return new BufferList(buffers);
  }

  toString(encoding, start, end) {
    return this.slice(start, end).toString(encoding);
  }

  consume(bytes) {
    bytes = Math.trunc(bytes);
    if (Number.isNaN(bytes) || bytes <= 0) return this;

    while (this._bufs.length && bytes > 0) {
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
    this._bufs.forEach((buf) => copy.append(buf));
    return copy;
  }

  destroy() {
    this._bufs.length = 0;
    this.length = 0;
    this.push(null);
  }
}

// Add buffer reading methods
(() => {
  const methods = {
    'readDoubleBE': 8,
    'readDoubleLE': 8,
    'readFloatBE': 4,
    'readFloatLE': 4,
    'readInt32BE': 4,
    'readInt32LE': 4,
    'readUInt32BE': 4,
    'readUInt32LE': 4,
    'readInt16BE': 2,
    'readInt16LE': 2,
    'readUInt16BE': 2,
    'readUInt16LE': 2,
    'readInt8': 1,
    'readUInt8': 1,
  };

  for (const [method, size] of Object.entries(methods)) {
    BufferList.prototype[method] = function (offset) {
      return this.slice(offset, offset + size)[method](0);
    };
  }
})();

module.exports = BufferList;
