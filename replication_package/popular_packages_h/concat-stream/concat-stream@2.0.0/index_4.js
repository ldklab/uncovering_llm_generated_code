const { Writable } = require('readable-stream');
const inherits = require('inherits');
const bufferFrom = require('buffer-from');

const U8 = typeof Uint8Array !== 'undefined' ? Uint8Array : require('typedarray').Uint8Array;

function ConcatStream(opts, cb) {
  if (!(this instanceof ConcatStream)) return new ConcatStream(opts, cb);

  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }
  opts = opts || {};
  
  this.encoding = opts.encoding ? String(opts.encoding).toLowerCase() : null;
  this.shouldInferEncoding = !this.encoding;
  
  if (this.encoding === 'u8' || this.encoding === 'uint8') {
    this.encoding = 'uint8array';
  }
  
  Writable.call(this, { objectMode: true });
  
  if (cb) this.on('finish', () => { cb(this.getBody()); });
  this.body = [];
}

inherits(ConcatStream, Writable);

ConcatStream.prototype._write = function(chunk, enc, next) {
  this.body.push(chunk);
  next();
};

ConcatStream.prototype.inferEncoding = function(buff) {
  const firstBuffer = buff === undefined ? this.body[0] : buff;
  if (Buffer.isBuffer(firstBuffer)) return 'buffer';
  if (typeof Uint8Array !== 'undefined' && firstBuffer instanceof Uint8Array) return 'uint8array';
  if (Array.isArray(firstBuffer)) return 'array';
  if (typeof firstBuffer === 'string') return 'string';
  if (Object.prototype.toString.call(firstBuffer) === "[object Object]") return 'object';
  return 'buffer';
};

ConcatStream.prototype.getBody = function() {
  if (!this.encoding && this.body.length === 0) return [];
  if (this.shouldInferEncoding) this.encoding = this.inferEncoding();
  switch (this.encoding) {
    case 'array':
      return arrayConcat(this.body);
    case 'string':
      return stringConcat(this.body);
    case 'buffer':
      return bufferConcat(this.body);
    case 'uint8array':
      return u8Concat(this.body);
    default:
      return this.body;
  }
};

function isBufferish(p) {
  return typeof p === 'string' || Array.isArray(p) || (p && typeof p.subarray === 'function');
}

function stringConcat(parts) {
  const strings = parts.map(p => {
    if (typeof p === 'string' || Buffer.isBuffer(p)) {
      return p;
    }
    return bufferFrom(isBufferish(p) ? p : String(p));
  });

  if (Buffer.isBuffer(parts[0])) {
    return Buffer.concat(strings).toString('utf8');
  }
  return strings.join('');
}

function bufferConcat(parts) {
  return Buffer.concat(parts.map(p => Buffer.isBuffer(p) ? p : bufferFrom(isBufferish(p) ? p : String(p))));
}

function arrayConcat(parts) {
  return parts.reduce((res, part) => res.concat(part), []);
}

function u8Concat(parts) {
  const length = parts.reduce((len, part) => len + bufferFrom(part).length, 0);
  const u8 = new U8(length);
  let offset = 0;
  parts.forEach(part => {
    part = typeof part === 'string' ? bufferFrom(part) : part;
    part.forEach(byte => {
      u8[offset++] = byte;
    });
  });
  return u8;
}

module.exports = ConcatStream;
