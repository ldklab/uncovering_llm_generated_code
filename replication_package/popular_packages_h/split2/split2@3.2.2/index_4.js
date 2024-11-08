'use strict';

const { Transform } = require('readable-stream');
const { StringDecoder } = require('string_decoder');

const kLast = Symbol('last');
const kDecoder = Symbol('decoder');

function transform(chunk, enc, callback) {
  let list;
  if (this.overflow) {
    const buffer = this[kDecoder].write(chunk);
    list = buffer.split(this.matcher);

    if (list.length === 1) return callback();

    list.shift();
    this.overflow = false;
  } else {
    this[kLast] += this[kDecoder].write(chunk);
    list = this[kLast].split(this.matcher);
  }

  this[kLast] = list.pop();

  for (let i = 0; i < list.length; i++) {
    try {
      this.push(this.mapper(list[i]));
    } catch (error) {
      return callback(error);
    }
  }

  this.overflow = this[kLast].length > this.maxLength;
  if (this.overflow && !this.skipOverflow) return callback(new Error('maximum buffer reached'));

  callback();
}

function flush(callback) {
  this[kLast] += this[kDecoder].end();

  if (this[kLast]) {
    try {
      this.push(this.mapper(this[kLast]));
    } catch (error) {
      return callback(error);
    }
  }

  callback();
}

function noop(input) {
  return input;
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
      } else if (typeof matcher === 'object' && !(matcher instanceof RegExp)) {
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
      break;
  }

  options = Object.assign({}, options);
  options.transform = transform;
  options.flush = flush;
  options.readableObjectMode = true;

  const stream = new Transform(options);

  stream[kLast] = '';
  stream[kDecoder] = new StringDecoder('utf8');
  stream.matcher = matcher;
  stream.mapper = mapper;
  stream.maxLength = options.maxLength;
  stream.skipOverflow = options.skipOverflow;
  stream.overflow = false;

  return stream;
}

module.exports = split;
