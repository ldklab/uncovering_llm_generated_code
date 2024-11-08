// readable-stream implementation

const { Readable: CoreReadable, Writable: CoreWritable, Transform: CoreTransform, Duplex: CoreDuplex, finished: coreFinished, pipeline: corePipeline } = require('stream');

// Custom implementation and export of ReadableStream classes

class Readable extends CoreReadable {
  // Additional implementation or overrides can be added here if needed
}

class Writable extends CoreWritable {
  // Additional implementation or overrides can be added here if needed
}

class Transform extends CoreTransform {
  // Additional implementation or overrides can be added here if needed
}

class Duplex extends CoreDuplex {
  // Additional implementation or overrides can be added here if needed
}

// Utility functions

function finished(stream, callback) {
  // Directly use Node's core finished function, can extend if needed
  return coreFinished(stream, callback);
}

function pipeline(...streams) {
  // Directly use Node's core pipeline function, can extend if needed
  return corePipeline(...streams);
}

// Exports

module.exports = {
  Readable,
  Writable,
  Transform,
  Duplex,
  finished,
  pipeline,
};

// Note: This is a simplistic mockup reflecting the userland integration of Node's core stream functionalities, aiming to provide
// the core API in a stable and consistent manner across Node.js versions and different environments.
