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
      this.on('pipe', (src) => src.on('error', piper));
      this.on('unpipe', (src) => src.removeListener('error', piper));
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
  }

  append(buf) {
    if (Buffer.isBuffer(buf)) {
      this._appendBuffer(buf);
    } else if (Array.isArray(buf)) {
      for (const item of buf) {
        this.append(item);
      }
    } else if (buf instanceof BufferList) {
      for (const buffer of buf._bufs) {
        this.append(buffer);
      }
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
    start = this._normalizeIndex(start);
    end = this._normalizeIndex(end);
    return this.copy(null, 0, start, end);
  }

  copy(dst, dstStart = 0, srcStart = 0, srcEnd) {
    srcEnd = srcEnd ?? this.length;
    if (srcEnd <= 0) return dst || Buffer.alloc(0);
    const copy = !!dst;
    let bytes = srcEnd - srcStart;
    let bufOffset = dstStart;
    const start = this._offset(srcStart);
    if (bytes <= this._bufs[start[0]].length - start[1]) {
      return copy ? this._bufs[start[0]].copy(dst, bufOffset, start[1], start[1] + bytes) 
                  : this._bufs[start[0]].slice(start[1], start[1] + bytes);
    }
    if (!copy) dst = Buffer.allocUnsafe(bytes);
    for (let i = start[0]; i < this._bufs.length; i++) {
      const buffer = this._bufs[i];
      const bufferLen = buffer.length - start[1];
      buffer.copy(dst, bufOffset, start[1], bytes > bufferLen ? buffer.length : start[1] + bytes);
      if ((bytes -= bufferLen) <= 0) break;
      bufOffset += bufferLen;
      start[1] = 0;
    }
    return dst.length > bufOffset ? dst.slice(0, bufOffset) : dst;
  }

  shallowSlice(start = 0, end = this.length) {
    start = start < 0 ? start + this.length : start;
    end = end < 0 ? end + this.length : end;
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
        bytes -= this._bufs.shift().length;
      } else {
        this._bufs[0] = this._bufs[0].slice(bytes);
        break;
      }
    }
    this.length -= bytes;
    return this;
  }

  duplicate() {
    const copy = new BufferList();
    for (const buf of this._bufs) {
      copy.append(buf);
    }
    return copy;
  }

  destroy() {
    this._bufs = [];
    this.length = 0;
    this.push(null);
  }

  _normalizeIndex(index) {
    return typeof index === 'number' && index < 0 ? this.length + index : index;
  }
}

(function addReadMethods() {
  const methods = {
    'readDoubleBE': 8, 'readDoubleLE': 8, 
    'readFloatBE': 4, 'readFloatLE': 4,
    'readInt32BE': 4, 'readInt32LE': 4, 
    'readUInt32BE': 4, 'readUInt32LE': 4,
    'readInt16BE': 2, 'readInt16LE': 2, 
    'readUInt16BE': 2, 'readUInt16LE': 2,
    'readInt8': 1, 'readUInt8': 1
  };

  for (const method in methods) {
    BufferList.prototype[method] = function (offset = 0) {
      return this.slice(offset, offset + methods[method])[method](0);
    };
  }
})();

module.exports = BufferList;
