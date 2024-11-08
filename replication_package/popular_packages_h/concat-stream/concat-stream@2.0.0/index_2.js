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
  const shouldInferEncoding = !encoding;

  if (encoding) {
    encoding = String(encoding).toLowerCase();
    if (encoding === 'u8' || encoding === 'uint8') {
      encoding = 'uint8array';
    }
  }

  Writable.call(this, { objectMode: true });

  this.encoding = encoding;
  this.shouldInferEncoding = shouldInferEncoding;

  if (cb) this.on('finish', () => cb(this.getBody()));
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
  if (typeof Uint8Array !== 'undefined' && firstBuffer instanceof Uint8Array) return 'uint8array';
  if (Array.isArray(firstBuffer)) return 'array';
  if (typeof firstBuffer === 'string') return 'string';
  if (Object.prototype.toString.call(firstBuffer) === "[object Object]") return 'object';
  return 'buffer';
};

ConcatStream.prototype.getBody = function () {
  if (!this.encoding && this.body.length === 0) return [];
  if (this.shouldInferEncoding) this.encoding = this.inferEncoding();
  switch (this.encoding) {
    case 'array': return arrayConcat(this.body);
    case 'string': return stringConcat(this.body);
    case 'buffer': return bufferConcat(this.body);
    case 'uint8array': return u8Concat(this.body);
    default: return this.body;
  }
};

function isBufferish(p) {
  return typeof p === 'string' || Array.isArray(p) || (p && typeof p.subarray === 'function');
}

function stringConcat(parts) {
  let strings = [];
  for (const p of parts) {
    if (typeof p === 'string' || Buffer.isBuffer(p)) {
      strings.push(p);
    } else if (isBufferish(p)) {
      strings.push(bufferFrom(p));
    } else {
      strings.push(bufferFrom(String(p)));
    }
  }
  if (Buffer.isBuffer(parts[0])) {
    strings = Buffer.concat(strings).toString('utf8');
  } else {
    strings = strings.join('');
  }
  return strings;
}

function bufferConcat(parts) {
  const bufs = parts.map(p => Buffer.isBuffer(p) ? p : bufferFrom(String(p)));
  return Buffer.concat(bufs);
}

function arrayConcat(parts) {
  return parts.reduce((res, part) => res.concat(part), []);
}

function u8Concat(parts) {
  let len = 0;
  for (let i = 0; i < parts.length; i++) {
    if (typeof parts[i] === 'string') {
      parts[i] = bufferFrom(parts[i]);
    }
    len += parts[i].length;
  }
  const u8 = new U8(len);
  for (let i = 0, offset = 0; i < parts.length; i++) {
    const part = parts[i];
    u8.set(part, offset);
    offset += part.length;
  }
  return u8;
}

module.exports = ConcatStream;
