'use strict';

const Stream = require('stream');
let exportedStream = null;

if (Stream && process.env.READABLE_STREAM === 'disable') {
  // Using native Node.js Stream module
  exportedStream = {
    _uint8ArrayToBuffer: Stream._uint8ArrayToBuffer,
    _isUint8Array: Stream._isUint8Array,
    isDisturbed: Stream.isDisturbed,
    isErrored: Stream.isErrored,
    isReadable: Stream.isReadable,
    Readable: Stream.Readable,
    Writable: Stream.Writable,
    Duplex: Stream.Duplex,
    Transform: Stream.Transform,
    PassThrough: Stream.PassThrough,
    addAbortSignal: Stream.addAbortSignal,
    finished: Stream.finished,
    destroy: Stream.destroy,
    pipeline: Stream.pipeline,
    compose: Stream.compose,
    Stream: Stream.Stream,
    default: null, // Assigned at the end
  };
  
  // Managing promises
  const promises = Stream.promises;
  Object.defineProperty(Stream, 'promises', {
    configurable: true,
    enumerable: true,
    get() {
      return promises;
    }
  });

} else {
  // Using custom stream implementation
  const CustomStream = require('../stream');
  const promises = require('../stream/promises');
  
  exportedStream = Object.assign(CustomStream.Readable, {
    _uint8ArrayToBuffer: CustomStream._uint8ArrayToBuffer,
    _isUint8Array: CustomStream._isUint8Array,
    isDisturbed: CustomStream.isDisturbed,
    isErrored: CustomStream.isErrored,
    isReadable: CustomStream.isReadable,
    Readable: CustomStream.Readable,
    Writable: CustomStream.Writable,
    Duplex: CustomStream.Duplex,
    Transform: CustomStream.Transform,
    PassThrough: CustomStream.PassThrough,
    addAbortSignal: CustomStream.addAbortSignal,
    finished: CustomStream.finished,
    destroy: CustomStream.Readable.destroy,
    pipeline: CustomStream.pipeline,
    compose: CustomStream.compose,
    Stream: CustomStream.Stream,
    default: null, // Assigned at the end
  });
  
  // Managing promises
  Object.defineProperty(CustomStream, 'promises', {
    configurable: true,
    enumerable: true,
    get() {
      return promises;
    }
  });
}

// Assign default export to allow default importing
exportedStream.default = exportedStream;
module.exports = exportedStream;
