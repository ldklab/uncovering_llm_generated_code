'use strict';

const { Transform } = require('stream');
const { StringDecoder } = require('string_decoder');

const kLast = Symbol('last');
const kDecoder = Symbol('decoder');

function handleChunk(chunk, enc, callback) {
  let segments;

  if (this.overflow) {
    const buffer = this[kDecoder].write(chunk);
    segments = buffer.split(this.matcher);

    if (segments.length === 1) return callback();

    segments.shift();
    this.overflow = false;
  } else {
    this[kLast] += this[kDecoder].write(chunk);
    segments = this[kLast].split(this.matcher);
  }

  this[kLast] = segments.pop();

  for (const segment of segments) {
    try {
      processSegment(this, this.mapper(segment));
    } catch (error) {
      return callback(error);
    }
  }

  this.overflow = this[kLast].length > this.maxLength;
  if (this.overflow && !this.skipOverflow) {
    callback(new Error('maximum buffer reached'));
    return;
  }

  callback();
}

function handleFlush(callback) {
  this[kLast] += this[kDecoder].end();

  if (this[kLast]) {
    try {
      processSegment(this, this.mapper(this[kLast]));
    } catch (error) {
      return callback(error);
    }
  }

  callback();
}

function processSegment(stream, value) {
  if (value !== undefined) {
    stream.push(value);
  }
}

function defaultMapper(data) {
  return data;
}

function splitStream(matcher, mapper, options) {
  matcher = matcher || /\r?\n/;
  mapper = mapper || defaultMapper;
  options = options || {};

  if (arguments.length === 1) {
    if (typeof matcher === 'function') {
      mapper = matcher;
      matcher = /\r?\n/;
    } else if (typeof matcher === 'object' && !(matcher instanceof RegExp) && !matcher[Symbol.split]) {
      options = matcher;
      matcher = /\r?\n/;
    }
  } else if (arguments.length === 2) {
    if (typeof matcher === 'function') {
      options = mapper;
      mapper = matcher;
      matcher = /\r?\n/;
    } else if (typeof mapper === 'object') {
      options = mapper;
      mapper = defaultMapper;
    }
  }

  options = { ...options, autoDestroy: true, transform: handleChunk, flush: handleFlush, readableObjectMode: true };
  
  const stream = new Transform(options);

  stream[kLast] = '';
  stream[kDecoder] = new StringDecoder('utf8');
  stream.matcher = matcher;
  stream.mapper = mapper;
  stream.maxLength = options.maxLength;
  stream.skipOverflow = options.skipOverflow || false;
  stream.overflow = false;

  stream._destroy = function (error, callback) {
    this._writableState.errorEmitted = false;
    callback(error);
  };

  return stream;
}

module.exports = splitStream;
