const { Transform } = require('readable-stream');

// Inherits function to set up prototype chain
function inherits(fn, sup) {
  fn.super_ = sup;
  fn.prototype = Object.create(sup.prototype, {
    constructor: { value: fn, enumerable: false, writable: true, configurable: true }
  });
}

// Helper function to return a transform construction function
function through2(construct) {
  return (options, transform, flush) => {
    if (typeof options === 'function') {
      flush = transform;
      transform = options;
      options = {};
    }
    if (typeof transform !== 'function') {
      transform = (chunk, enc, cb) => cb(null, chunk);
    }
    if (typeof flush !== 'function') {
      flush = null;
    }
    return construct(options, transform, flush);
  };
}

// Create a transform stream
const make = through2((options, transform, flush) => {
  const t2 = new Transform(options);
  t2._transform = transform;
  if (flush) t2._flush = flush;
  return t2;
});

// Create a reusable stream prototype
const ctor = through2((options, transform, flush) => {
  function Through2(override) {
    if (!(this instanceof Through2)) {
      return new Through2(override);
    }
    this.options = Object.assign({}, options, override);
    Transform.call(this, this.options);
    this._transform = transform;
    if (flush) this._flush = flush;
  }
  inherits(Through2, Transform);
  return Through2;
});

// Create an object mode transform stream
const obj = through2((options, transform, flush) => {
  const t2 = new Transform(Object.assign({ objectMode: true, highWaterMark: 16 }, options));
  t2._transform = transform;
  if (flush) t2._flush = flush;
  return t2;
});

// Export functionalities
module.exports = make;
module.exports.ctor = ctor;
module.exports.obj = obj;
