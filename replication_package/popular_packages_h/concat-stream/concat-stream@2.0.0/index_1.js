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
  if (!opts) opts = {};

  let encoding = opts.encoding;
  this.shouldInferEncoding = false;

  if (!encoding) {
    this.shouldInferEncoding = true;
  } else {
    encoding = String(encoding).toLowerCase();
    if (encoding === 'u8' || encoding === 'uint8') encoding = 'uint8array';
  }

  Writable.call(this, { objectMode: true });

  this.encoding = encoding;

  if (cb) this.on('finish', () => cb(this.getBody()));
  this.body = [];
}

module.exports = ConcatStream;
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
  if (this.encoding === 'array') return arrayConcat(this.body);
  if (this.encoding === 'string') return stringConcat(this.body);
  if (this.encoding === 'buffer') return bufferConcat(this.body);
  if (this.encoding === 'uint8array') return u8Concat(this.body);
  return this.body;
};

function stringConcat(parts) {
  let strings = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (typeof p === 'string') {
      strings.push(p);
    } else if (Buffer.isBuffer(p)) {
      strings.push(p);
    } else if (isBufferish(p)) {
      strings.push(bufferFrom(p));
    } else {
      strings.push(bufferFrom(String(p)));
    }
  }
  return Buffer.isBuffer(parts[0]) ? Buffer.concat(strings).toString('utf8') : strings.join('');
}

function bufferConcat(parts) {
  const bufs = parts.map(p => Buffer.isBuffer(p) ? p : bufferFrom(p));
  return Buffer.concat(bufs);
}

function arrayConcat(parts) {
  return parts.reduce((res, part) => res.concat(part), []);
}

function u8Concat(parts) {
  const len = parts.reduce((total, part) => total + (typeof part === 'string' ? bufferFrom(part).length : part.length), 0);
  const u8 = new U8(len);
  let offset = 0;
  parts.forEach(part => {
    if (typeof part === 'string') part = bufferFrom(part);
    part.forEach(value => u8[offset++] = value);
  });
  return u8;
}

function isArrayish(arr) {
  return /Array\]$/.test(Object.prototype.toString.call(arr));
}

function isBufferish(p) {
  return typeof p === 'string' || isArrayish(p) || (p && typeof p.subarray === 'function');
}
