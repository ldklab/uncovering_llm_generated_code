'use strict';

const Stream = require('stream');

function setupExports(streamModule, promisesModule) {
  const promises = promisesModule || streamModule.promises;

  module.exports = {
    _uint8ArrayToBuffer: streamModule._uint8ArrayToBuffer,
    _isUint8Array: streamModule._isUint8Array,
    isDisturbed: streamModule.isDisturbed,
    isErrored: streamModule.isErrored,
    isReadable: streamModule.isReadable,
    Readable: streamModule.Readable,
    Writable: streamModule.Writable,
    Duplex: streamModule.Duplex,
    Transform: streamModule.Transform,
    PassThrough: streamModule.PassThrough,
    addAbortSignal: streamModule.addAbortSignal,
    finished: streamModule.finished,
    destroy: streamModule.destroy,
    pipeline: streamModule.pipeline,
    compose: streamModule.compose,
    Stream: streamModule.Stream,
    promises,
    default: this
  };
  
  Object.defineProperty(streamModule, 'promises', {
    configurable: true,
    enumerable: true,
    get() {
      return promises;
    }
  });
}

if (Stream && process.env.READABLE_STREAM === 'disable') {
  setupExports(Stream);
} else {
  const CustomStream = require('../stream');
  const customPromises = require('../stream/promises');
  setupExports(CustomStream, customPromises);
  module.exports.destroy = CustomStream.Readable.destroy;
}
