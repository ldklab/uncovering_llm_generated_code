'use strict';

const Stream = require('stream');
let exportingStream;

if (Stream && process.env.READABLE_STREAM === 'disable') {
  exportingStream = Stream;
} else {
  exportingStream = require('../stream');
  exportingStream.promises = require('../stream/promises');
}

// Explicitly export Stream components for both Node.js's and custom streams
const {
  _uint8ArrayToBuffer,
  _isUint8Array,
  isDisturbed,
  isErrored,
  isReadable,
  Readable,
  Writable,
  Duplex,
  Transform,
  PassThrough,
  addAbortSignal,
  finished,
  destroy,
  pipeline,
  compose
} = exportingStream;

module.exports = {
  _uint8ArrayToBuffer,
  _isUint8Array,
  isDisturbed,
  isErrored,
  isReadable,
  Readable,
  Writable,
  Duplex,
  Transform,
  PassThrough,
  addAbortSignal,
  finished,
  destroy,
  pipeline,
  compose,
  Stream: exportingStream.Stream,
  promises: exportingStream.promises,
  default: this
};
