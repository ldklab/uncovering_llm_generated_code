const { 
  Readable: CoreReadable, 
  Writable: CoreWritable, 
  Transform: CoreTransform, 
  Duplex: CoreDuplex, 
  finished: coreFinished, 
  pipeline: corePipeline 
} = require('stream');

class Readable extends CoreReadable {
  // Extend or modify functionality if needed
}

class Writable extends CoreWritable {
  // Extend or modify functionality if needed
}

class Transform extends CoreTransform {
  // Extend or modify functionality if needed
}

class Duplex extends CoreDuplex {
  // Extend or modify functionality if needed
}

function finished(stream, callback) {
  // Optionally extend functionality
  return coreFinished(stream, callback);
}

function pipeline(...streams) {
  // Optionally extend functionality
  return corePipeline(...streams);
}

module.exports = {
  Readable,
  Writable,
  Transform,
  Duplex,
  finished,
  pipeline,
};
