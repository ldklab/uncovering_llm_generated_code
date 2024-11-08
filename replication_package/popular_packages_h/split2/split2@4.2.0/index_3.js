'use strict';

const { Transform } = require('stream');
const { StringDecoder } = require('string_decoder');

const kLast = Symbol('last');
const kDecoder = Symbol('decoder');

function transform(chunk, enc, cb) {
  let list;
  if (this.overflow) {
    const buffer = this[kDecoder].write(chunk);
    list = buffer.split(this.matcher);

    if (list.length === 1) return cb();

    list.shift();
    this.overflow = false;
  } else {
    this[kLast] += this[kDecoder].write(chunk);
    list = this[kLast].split(this.matcher);
  }

  this[kLast] = list.pop();

  for (const line of list) {
    try {
      this.push(this.mapper(line));
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
      this.push(this.mapper(this[kLast]));
    } catch (error) {
      return cb(error);
    }
  }

  cb();
}

function noop(data) {
  return data;
}

function split(matcher = /\r?\n/, mapper = noop, options = {}) {
  if (typeof matcher === 'function') {
    [matcher, mapper] = [/\r?\n/, matcher];
  } else if (typeof matcher === 'object' && !(matcher instanceof RegExp) && !matcher[Symbol.split]) {
    [matcher, options] = [/\r?\n/, matcher];
  }

  if (typeof mapper === 'object') {
    [mapper, options] = [noop, mapper];
  }

  const stream = new Transform({
    ...options,
    autoDestroy: true,
    transform,
    flush,
    readableObjectMode: true
  });

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
