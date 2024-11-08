'use strict'

const { Transform } = require('stream');
const { StringDecoder } = require('string_decoder');

const kLast = Symbol('last');
const kDecoder = Symbol('decoder');

function transform(chunk, enc, cb) {
  let list;

  if (this.overflow) {
    const buf = this[kDecoder].write(chunk);
    list = buf.split(this.matcher);

    if (list.length === 1) return cb();

    list.shift();
    this.overflow = false;
  } else {
    this[kLast] += this[kDecoder].write(chunk);
    list = this[kLast].split(this.matcher);
  }

  this[kLast] = list.pop();

  for (let i = 0; i < list.length; i++) {
    try {
      push(this, this.mapper(list[i]));
    } catch (error) {
      return cb(error);
    }
  }

  this.overflow = this[kLast].length > this.maxLength;
  if (this.overflow && !this.skipOverflow) {
    return cb(new Error('maximum buffer reached'));
  }

  cb();
}

function flush(cb) {
  this[kLast] += this[kDecoder].end();

  if (this[kLast]) {
    try {
      push(this, this.mapper(this[kLast]));
    } catch (error) {
      return cb(error);
    }
  }

  cb();
}

function push(self, val) {
  if (val !== undefined) {
    self.push(val);
  }
}

function noop(incoming) {
  return incoming;
}

function split(matcher, mapper, options) {
  matcher = matcher || /\r?\n/;
  mapper = mapper || noop;
  options = options || {};

  switch (arguments.length) {
    case 1:
      if (typeof matcher === 'function') {
        mapper = matcher;
        matcher = /\r?\n/;
      } else if (typeof matcher === 'object' && !(matcher instanceof RegExp) && !matcher[Symbol.split]) {
        options = matcher;
        matcher = /\r?\n/;
      }
      break;
    case 2:
      if (typeof matcher === 'function') {
        options = mapper;
        mapper = matcher;
        matcher = /\r?\n/;
      } else if (typeof mapper === 'object') {
        options = mapper;
        mapper = noop;
      }
  }

  options = Object.assign({}, options);
  options.autoDestroy = true;
  options.transform = transform;
  options.flush = flush;
  options.readableObjectMode = true;

  const stream = new Transform(options);

  stream[kLast] = '';
  stream[kDecoder] = new StringDecoder('utf8');
  stream.matcher = matcher;
  stream.mapper = mapper;
  stream.maxLength = options.maxLength;
  stream.skipOverflow = options.skipOverflow || false;
  stream.overflow = false;

  stream._destroy = function (err, cb) {
    this._writableState.errorEmitted = false;
    cb(err);
  };

  return stream;
}

module.exports = split;
