const { Transform } = require('stream');

// Primary function to create a through2 transform stream
function through2(options, transformFn, flushFn) {
  if (typeof options === 'function') {
    flushFn = transformFn;
    transformFn = options;
    options = {};
  }

  const defaultTransform = (chunk, enc, cb) => cb(null, chunk);

  const transform = new Transform({
    ...options,
    transform(chunk, enc, callback) {
      (transformFn || defaultTransform).call(this, chunk, enc, callback);
    },
    flush(callback) {
      if (flushFn) {
        flushFn.call(this, callback);
      } else {
        callback();
      }
    }
  });

  return transform;
}

// Helper method for streams in object mode
through2.obj = function(transformFn, flushFn) {
  return through2({ objectMode: true }, transformFn, flushFn);
};

// Function to create a constructor for a through2 transform stream
through2.ctor = function(options, transformFn, flushFn) {
  if (typeof options === 'function') {
    flushFn = transformFn;
    transformFn = options;
    options = {};
  }

  const defaultTransform = (chunk, enc, cb) => cb(null, chunk);

  class Through2 extends Transform {
    constructor(additionalOptions) {
      super(additionalOptions ? { ...options, ...additionalOptions } : options);
    }

    _transform(chunk, encoding, callback) {
      (transformFn || defaultTransform).call(this, chunk, encoding, callback);
    }

    _flush(callback) {
      if (flushFn) {
        flushFn.call(this, callback);
      } else {
        callback();
      }
    }
  }

  return Through2;
};

module.exports = through2;
