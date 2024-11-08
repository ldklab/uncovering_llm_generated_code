const Stream = require('stream');

const isStreamDisabled = process.env.READABLE_STREAM === 'disable';

let exportedModule;

if (isStreamDisabled && Stream) {
  exportedModule = Stream.Readable;
  Object.assign(exportedModule, Stream);
  exportedModule.Stream = Stream;
} else {
  exportedModule = require('./lib/_stream_readable.js');
  exportedModule.Stream = Stream || exportedModule;
  exportedModule.Readable = exportedModule;
  exportedModule.Writable = require('./lib/_stream_writable.js');
  exportedModule.Duplex = require('./lib/_stream_duplex.js');
  exportedModule.Transform = require('./lib/_stream_transform.js');
  exportedModule.PassThrough = require('./lib/_stream_passthrough.js');
  exportedModule.finished = require('./lib/internal/streams/end-of-stream.js');
  exportedModule.pipeline = require('./lib/internal/streams/pipeline.js');
}

module.exports = exportedModule;
