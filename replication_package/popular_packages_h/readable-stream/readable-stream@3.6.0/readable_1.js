const Stream = require('stream');

if (process.env.READABLE_STREAM === 'disable' && Stream) {
  module.exports = Stream.Readable;
  Object.assign(module.exports, Stream);
  module.exports.Stream = Stream;
} else {
  const readable = require('./lib/_stream_readable.js');
  module.exports = readable;
  exports.Stream = Stream || readable;
  exports.Readable = readable;
  exports.Writable = require('./lib/_stream_writable.js');
  exports.Duplex = require('./lib/_stream_duplex.js');
  exports.Transform = require('./lib/_stream_transform.js');
  exports.PassThrough = require('./lib/_stream_passthrough.js');
  exports.finished = require('./lib/internal/streams/end-of-stream.js');
  exports.pipeline = require('./lib/internal/streams/pipeline.js');
}
