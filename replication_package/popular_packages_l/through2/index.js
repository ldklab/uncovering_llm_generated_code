const { Transform } = require('stream');

// Main through2 function
function through2(options, transformFunction, flushFunction) {
  if (typeof options === 'function') {
    flushFunction = transformFunction;
    transformFunction = options;
    options = {};
  }

  if (!transformFunction) transformFunction = function(chunk, enc, cb) { cb(null, chunk); };
  
  const transform = new Transform({
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

  return transform;
}

// Convenience method for object mode streams
through2.obj = function(transformFunction, flushFunction) {
  return through2({ objectMode: true }, transformFunction, flushFunction);
};

// Constructor creation function
through2.ctor = function(options, transformFunction, flushFunction) {
  if (typeof options === 'function') {
    flushFunction = transformFunction;
    transformFunction = options;
    options = {};
  }

  if (!transformFunction) transformFunction = function(chunk, enc, cb) { cb(null, chunk); };
  
  class Through2 extends Transform {
    constructor(overrideOptions) {
      super(overrideOptions ? { ...options, ...overrideOptions } : options);
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
  }

  return Through2;
};

module.exports = through2;
