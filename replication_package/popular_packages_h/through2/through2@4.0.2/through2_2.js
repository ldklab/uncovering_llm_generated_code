const { Transform } = require('readable-stream');

// Utility function to handle inheritance
function inherits(fn, sup) {
  fn.super_ = sup;
  fn.prototype = Object.create(sup.prototype, {
    constructor: { value: fn, enumerable: false, writable: true, configurable: true }
  });
}

function through2(createTransform) {
  return (options = {}, transform = (chunk, enc, cb) => cb(null, chunk), flush = null) => {
    if (typeof options === 'function') {
      [flush, transform, options] = [transform, options, {}];
    }
    return createTransform(options, transform, flush);
  };
}

// Create a transform stream
const make = through2((options, transform, flush) => {
  const t2 = new Transform(options);
  t2._transform = transform;
  if (flush) t2._flush = flush;
  return t2;
});

// Constructor function for transform stream
const ctor = through2((options, transform, flush) => {
  function Through2(override = {}) {
    if (!(this instanceof Through2)) return new Through2(override);
    this.options = { ...options, ...override };
    Transform.call(this, this.options);
    this._transform = transform;
    if (flush) this._flush = flush;
  }
  inherits(Through2, Transform);
  return Through2;
});

// Create an object mode transform stream
const obj = through2((options, transform, flush) => {
  const t2 = new Transform({ objectMode: true, highWaterMark: 16, ...options });
  t2._transform = transform;
  if (flush) t2._flush = flush;
  return t2;
});

module.exports = make;
module.exports.ctor = ctor;
module.exports.obj = obj;
