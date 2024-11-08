const Stream = require('stream');
let exports;

if (process.env.READABLE_STREAM === 'disable' && Stream) {
  exports = Stream.Readable;
  Object.assign(exports, Stream);
  exports.Stream = Stream;
} else {
  const _stream_readable = require('./lib/_stream_readable.js');
  const _stream_writable = require('./lib/_stream_writable.js');
  const _stream_duplex = require('./lib/_stream_duplex.js');
  const _stream_transform = require('./lib/_stream_transform.js');
  const _stream_passthrough = require('./lib/_stream_passthrough.js');
  const _end_of_stream = require('./lib/internal/streams/end-of-stream.js');
  const _pipeline = require('./lib/internal/streams/pipeline.js');
  
  exports = _stream_readable;
  exports.Stream = Stream || _stream_readable;
  exports.Readable = _stream_readable;
  exports.Writable = _stream_writable;
  exports.Duplex = _stream_duplex;
  exports.Transform = _stream_transform;
  exports.PassThrough = _stream_passthrough;
  exports.finished = _end_of_stream;
  exports.pipeline = _pipeline;
}

module.exports = exports;
