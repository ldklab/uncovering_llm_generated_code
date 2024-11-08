// Import core stream modules from Node.js
const {
  Readable: CoreReadable,
  Writable: CoreWritable,
  Transform: CoreTransform,
  Duplex: CoreDuplex,
  finished: coreFinished,
  pipeline: corePipeline,
} = require('stream');

// Custom class implementations extending the core Node.js stream classes
class Readable extends CoreReadable {
  // Extendable with additional methods or overrides
}

class Writable extends CoreWritable {
  // Extendable with additional methods or overrides
}

class Transform extends CoreTransform {
  // Extendable with additional methods or overrides
}

class Duplex extends CoreDuplex {
  // Extendable with additional methods or overrides
}

// Utility functions for stream handling

// Wrapper function for finished(), delegates to Node's core stream finished method
function finished(stream, callback) {
  return coreFinished(stream, callback);
}

// Wrapper function for pipeline(), delegates to Node's core stream pipeline method
function pipeline(...streams) {
  return corePipeline(...streams);
}

// Exporting custom implementations and utility functions
module.exports = {
  Readable,
  Writable,
  Transform,
  Duplex,
  finished,
  pipeline,
};

// This module provides a custom implementation of Node.js streams that extends the core functionality,
// allowing further customization or stability across different Node.js versions.
