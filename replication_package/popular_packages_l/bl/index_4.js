const { Duplex } = require('stream');

class BufferList {
  constructor(buffers) {
    this.buffers = [];
    this.offset = 0;
    this.length = 0;
    if (buffers) {
      this.append(buffers);
    }
  }
  
  static isBufferList(obj) {
    return obj instanceof BufferList || obj instanceof BufferListStream;
  }
  
  append(buffer) {
    if (Array.isArray(buffer)) {
      buffer.forEach(buf => this.append(buf));
    } else {
      if (typeof buffer === 'string') buffer = Buffer.from(buffer);
      if (Buffer.isBuffer(buffer) || buffer instanceof BufferList) {
        this.buffers.push(buffer);
        this.length += buffer.length;
      }
    }
    return this;
  }
  
  get(index) {
    let result = this.slice(index, index + 1);
    return result.length > 0 ? result[0] : undefined;
  }
  
  indexOf(value, byteOffset = 0, encoding) {
    if (typeof value === 'string') value = Buffer.from(value, encoding);
    for (let i = byteOffset; i < this.length; i++) {
      const sublist = this.slice(i, i + value.length);
      if (Buffer.compare(sublist, value) === 0) {
        return i;
      }
    }
    return -1;
  }
  
  slice(start = 0, end = this.length) {
    let remaining = end - start;
    const buffers = [];
    for (const buffer of this.buffers) {
      if (!remaining) break;
      const slice = buffer.slice(start - this.offset, Math.min(buffer.length, start - this.offset + remaining));
      if (slice.length > 0) {
        buffers.push(slice);
        remaining -= slice.length;
        start += slice.length;
      }
      this.offset += buffer.length;
    }
    return Buffer.concat(buffers, end - start);
  }
  
  shallowSlice(start = 0, end = this.length) {
    const result = new BufferList();
    let currentOffset = 0;
    for (const buffer of this.buffers) {
      const bufferEnd = currentOffset + buffer.length;
      if (bufferEnd > start) {
        const bufferStart = Math.max(0, start - currentOffset);
        const sliceEnd = Math.min(buffer.length, end - currentOffset);
        result.append(buffer.slice(bufferStart, sliceEnd));
        if (bufferEnd >= end) break;
      }
      currentOffset = bufferEnd;
    }
    return result;
  }

  copy(dest, destStart = 0, srcStart = 0, srcEnd = this.length) {
    const slice = this.slice(srcStart, srcEnd);
    dest.set(slice, destStart);
  }

  duplicate() {
    const copy = new BufferList();
    copy.buffers = this.buffers.map(buf => buf.slice());
    copy.length = this.length;
    return copy;
  }

  consume(bytes) {
    while (bytes > 0 && this.buffers.length > 0) {
      let buf = this.buffers[0];
      if (buf.length <= bytes) {
        this.buffers.shift();
        bytes -= buf.length;
      } else {
        this.buffers[0] = buf.slice(bytes);
        bytes = 0;
      }
      this.length -= bytes;
    }
  }
  
  toString(encoding, start, end) {
    return this.slice(start, end).toString(encoding);
  }

  read(type, offset, noAssert = false) {
    offset = offset || 0;
    const MethodMap = {
      readDoubleBE: 'readDoubleBE', readDoubleLE: 'readDoubleLE',
      readFloatBE: 'readFloatBE', readFloatLE: 'readFloatLE',
      readBigInt64BE: 'readBigInt64BE', readBigInt64LE: 'readBigInt64LE',
      readBigUInt64BE: 'readBigUInt64BE', readBigUInt64LE: 'readBigUInt64LE',
      readInt32BE: 'readInt32BE', readInt32LE: 'readInt32LE',
      readUInt32BE: 'readUInt32BE', readUInt32LE: 'readUInt32LE',
      readInt16BE: 'readInt16BE', readInt16LE: 'readInt16LE',
      readUInt16BE: 'readUInt16BE', readUInt16LE: 'readUInt16LE',
      readInt8: 'readInt8', readUInt8: 'readUInt8'
    };

    const method = MethodMap[type];
    if (!method) throw new Error('Invalid read method');
    
    const buf = this.slice(offset, offset + Buffer.byteLength(Buffer[method]));
    return buf[method](0, noAssert);
  }
}

class BufferListStream extends Duplex {
  constructor(callback) {
    super();
    this.bl = new BufferList();
    if (typeof callback === 'function') {
      this._callback = callback;
    }
  }

  _write(chunk, encoding, callback) {
    this.bl.append(chunk);
    callback();
  }

  _read(size) {
    this.push(this.bl.slice(0, size));
    this.bl.consume(size);
  }

  end(chunk, encoding, callback) {
    if (chunk) this.write(chunk, encoding);
    super.end(() => {
      if (this._callback) this._callback(null, this.bl);
      if (callback) callback();
    });
  }
}

module.exports = {
  BufferList,
  BufferListStream
};
