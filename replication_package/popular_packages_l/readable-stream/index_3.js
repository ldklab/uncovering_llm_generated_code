const { Readable: CoreReadable, Writable: CoreWritable, Transform: CoreTransform, Duplex: CoreDuplex, finished: coreFinished, pipeline: corePipeline } = require('stream');

// Custom implementation of ReadableStream classes extending Node.js core stream classes

class Readable extends CoreReadable {
  // No additional overrides or implementation; serves as an extension point
}

class Writable extends CoreWritable {
  // No additional overrides or implementation; serves as an extension point
}

class Transform extends CoreTransform {
  // No additional overrides or implementation; serves as an extension point
}

class Duplex extends CoreDuplex {
  // No additional overrides or implementation; serves as an extension point
}

// Utility functions leveraging Node.js core utilities

function finished(stream, callback) {
  // Directly utilizes Node.js's core finished function
  return coreFinished(stream, callback);
}

function pipeline(...streams) {
  // Directly utilizes Node.js's core pipeline function
  return corePipeline(...streams);
}

// Exporting these classes and functions to be used elsewhere in applications
module.exports = {
  Readable,
  Writable,
  Transform,
  Duplex,
  finished,
  pipeline,
};

// This code provides an extension and simplification layer over Node.js core stream functionalities, intended to offer a stable API.
