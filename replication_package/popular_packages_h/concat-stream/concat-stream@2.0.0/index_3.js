const { Writable } = require('readable-stream');
const inherits = require('inherits');
const bufferFrom = require('buffer-from');

const U8 = typeof Uint8Array === 'undefined' ? require('typedarray').Uint8Array : Uint8Array;

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
  
  if (cb) this.on('finish', () => { cb(this.getBody()) });
  
  this.body = [];
}

inherits(ConcatStream, Writable);

ConcatStream.prototype._write = function(chunk, enc, next) {
  this.body.push(chunk);
  next();
};

ConcatStream.prototype.inferEncoding = function (buff) {
  const firstBuffer = buff === undefined ? this.body[0] : buff;
  if (Buffer.isBuffer(firstBuffer)) return 'buffer';
  if (firstBuffer instanceof Uint8Array) return 'uint8array';
  if (Array.isArray(firstBuffer)) return 'array';
  if (typeof firstBuffer === 'string') return 'string';
  if (Object.prototype.toString.call(firstBuffer) === "[object Object]") return 'object';
  return 'buffer';
};

ConcatStream.prototype.getBody = function () {
  if (this.body.length === 0 && !this.encoding) return [];
  if (this.shouldInferEncoding) this.encoding = this.inferEncoding();
  switch(this.encoding) {
    case 'array': return arrayConcat(this.body);
    case 'string': return stringConcat(this.body);
    case 'buffer': return bufferConcat(this.body);
    case 'uint8array': return u8Concat(this.body);
    default: return this.body;
  }
};

function stringConcat(parts) {
  return parts.map(p => typeof p === 'string' ? p : bufferFrom(String(p)))
              .join('');
}

function bufferConcat(parts) {
  return Buffer.concat(parts.map(p => Buffer.isBuffer(p) ? p : bufferFrom(String(p))));
}

function arrayConcat(parts) {
  return parts.reduce((res, part) => res.concat(part), []);
}

function u8Concat(parts) {
  const len = parts.reduce((total, part) => total + part.length, 0);
  const u8 = new U8(len);
  parts.reduce((offset, part) => {
    u8.set(part, offset);
    return offset + part.length;
  }, 0);
  return u8;
}

module.exports = ConcatStream;
