'use strict'

const { Transform } = require('stream')
const { StringDecoder } = require('string_decoder')
const kLast = Symbol('last')
const kDecoder = Symbol('decoder')

function transform(chunk, enc, cb) {
  let list
  if (this.overflow) {
    let buf = this[kDecoder].write(chunk)
    list = buf.split(this.matcher)

    if (list.length === 1) return cb()

    list.shift()
    this.overflow = false
  } else {
    this[kLast] += this[kDecoder].write(chunk)
    list = this[kLast].split(this.matcher)
  }

  this[kLast] = list.pop()

  for (let i = 0; i < list.length; i++) {
    try {
      push(this, this.mapper(list[i]))
    } catch (error) {
      return cb(error)
    }
  }

  this.overflow = this[kLast].length > this.maxLength
  if (this.overflow && !this.skipOverflow) return cb(new Error('maximum buffer reached'))

  cb()
}

function flush(cb) {
  this[kLast] += this[kDecoder].end()

  if (this[kLast]) {
    try {
      push(this, this.mapper(this[kLast]))
    } catch (error) {
      return cb(error)
    }
  }

  cb()
}

function push(self, val) {
  if (val !== undefined) {
    self.push(val)
  }
}

function noop(incoming) {
  return incoming
}

function split(matcher, mapper, options = {}) {
  if (typeof matcher === 'function') {
    mapper = matcher
    matcher = /\r?\n/
  } else if (typeof matcher === 'object' && !(matcher instanceof RegExp)) {
    options = matcher
    matcher = /\r?\n/
    mapper = noop
  } else if (typeof mapper === 'object') {
    options = mapper
    mapper = noop
  }

  const streamOptions = {
    ...options,
    transform,
    flush,
    readableObjectMode: true
  }

  const stream = new Transform(streamOptions)

  stream[kLast] = ''
  stream[kDecoder] = new StringDecoder('utf8')
  stream.matcher = matcher || /\r?\n/
  stream.mapper = mapper || noop
  stream.maxLength = options.maxLength || Infinity
  stream.skipOverflow = options.skipOverflow || false
  stream.overflow = false

  return stream
}

module.exports = split
