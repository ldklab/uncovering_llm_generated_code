'use strict';

const { Transform } = require('readable-stream');
const { StringDecoder } = require('string_decoder');

const kLast = Symbol('last');
const kDecoder = Symbol('decoder');

function transform(chunk, enc, cb) {
  let lines;
  if (this.overflow) {
    const buffer = this[kDecoder].write(chunk);
    lines = buffer.split(this.matcher);
    
    if (lines.length === 1) return cb();

    lines.shift();
    this.overflow = false;
  } else {
    this[kLast] += this[kDecoder].write(chunk);
    lines = this[kLast].split(this.matcher);
  }

  this[kLast] = lines.pop();

  for (const line of lines) {
    try {
      push(this, this.mapper(line));
    } catch (error) {
      return cb(error);
    }
  }

  this.overflow = this[kLast].length > this.maxLength;
  if (this.overflow && !this.skipOverflow) return cb(new Error('maximum buffer reached'));

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

function push(self, value) {
  if (value !== undefined) {
    self.push(value);
  }
}

function noop(value) {
  return value;
}

function split(matcher, mapper, options = {}) {
  if (typeof matcher === 'function') {
    mapper = matcher;
    matcher = /\r?\n/;
  } else if (typeof matcher === 'object' && !(matcher instanceof RegExp)) {
    options = matcher;
    matcher = /\r?\n/;
  }

  if (typeof mapper === 'object') {
    options = mapper;
    mapper = noop;
  }

  const streamOptions = {
    ...options,
    transform,
    flush,
    readableObjectMode: true,
  };

  const stream = new Transform(streamOptions);

  stream[kLast] = '';
  stream[kDecoder] = new StringDecoder('utf8');
  stream.matcher = matcher || /\r?\n/;
  stream.mapper = mapper || noop;
  stream.maxLength = options.maxLength || Infinity;
  stream.skipOverflow = options.skipOverflow || false;
  stream.overflow = false;

  return stream;
}

module.exports = split;
