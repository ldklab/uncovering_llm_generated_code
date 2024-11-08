const { Transform } = require('stream');

function through2(optionsOrTransformFn, transformFnOrFlushFn, flushFn) {
  let options = {};
  let transformFunction;
  let flushFunction;

  if (typeof optionsOrTransformFn === 'function') {
    flushFunction = transformFnOrFlushFn;
    transformFunction = optionsOrTransformFn;
  } else {
    options = optionsOrTransformFn || {};
    transformFunction = transformFnOrFlushFn;
    flushFunction = flushFn;
  }

  transformFunction = transformFunction ||
    function (chunk, enc, cb) { cb(null, chunk); };

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

through2.obj = function(transformFunction, flushFunction) {
  return through2({ objectMode: true }, transformFunction, flushFunction);
};

through2.ctor = function(optionsOrTransformFn, transformFnOrFlushFn, flushFn) {
  let options = {};
  let transformFunction;
  let flushFunction;

  if (typeof optionsOrTransformFn === 'function') {
    flushFunction = transformFnOrFlushFn;
    transformFunction = optionsOrTransformFn;
  } else {
    options = optionsOrTransformFn || {};
    transformFunction = transformFnOrFlushFn;
    flushFunction = flushFn;
  }

  transformFunction = transformFunction ||
    function (chunk, enc, cb) { cb(null, chunk); };

  return class ThroughTransform extends Transform {
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
  };
};

module.exports = through2;
