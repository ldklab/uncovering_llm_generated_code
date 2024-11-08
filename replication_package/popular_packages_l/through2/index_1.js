const { Transform } = require('stream');

// Main function to create a transform stream
function through2(options = {}, transformFunction = (chunk, enc, cb) => cb(null, chunk), flushFunction) {
  // Check if the first argument is the transform function
  if (typeof options === 'function') {
    [flushFunction, transformFunction, options] = [transformFunction, options, {}];
  }

  // Create and return a Transform stream with the specified options and logic
  return new Transform({
    ...options,
    transform(chunk, enc, callback) {
      transformFunction.call(this, chunk, enc, callback);
    },
    flush(callback) {
      if (flushFunction) {
        flushFunction.call(this, callback);
      } else {
        callback();
      }
    }
  });
}

// Method to create an object mode stream
through2.obj = function(transformFunction, flushFunction) {
  return through2({ objectMode: true }, transformFunction, flushFunction);
};

// Function to create a transform stream constructor
through2.ctor = function(options = {}, transformFunction = (chunk, enc, cb) => cb(null, chunk), flushFunction) {
  if (typeof options === 'function') {
    [flushFunction, transformFunction, options] = [transformFunction, options, {}];
  }

  return class Through2 extends Transform {
    constructor(overrideOptions) {
      super({ ...options, ...overrideOptions });
    }

    _transform(chunk, encoding, callback) {
      transformFunction.call(this, chunk, encoding, callback);
    }

    _flush(callback) {
      if (flushFunction) {
        flushFunction.call(this, callback);
      } else {
        callback();
      }
    }
  };
};

module.exports = through2;
