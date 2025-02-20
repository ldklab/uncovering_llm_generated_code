const { Transform } = require('readable-stream');

function inherits(subConstructor, superConstructor) {
  subConstructor.super_ = superConstructor;
  subConstructor.prototype = Object.create(superConstructor.prototype, {
    constructor: { value: subConstructor, enumerable: false, writable: true, configurable: true }
  });
}

function createThrough2(constructor) {
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

    return constructor(options, transform, flush);
  };
}

const make = createThrough2((options, transform, flush) => {
  const t2 = new Transform(options);

  t2._transform = transform;

  if (flush) {
    t2._flush = flush;
  }

  return t2;
});

const ctor = createThrough2((options, transform, flush) => {
  function Through2(override) {
    if (!(this instanceof Through2)) {
      return new Through2(override);
    }

    this.options = Object.assign({}, options, override);
    Transform.call(this, this.options);

    this._transform = transform;

    if (flush) {
      this._flush = flush;
    }
  }

  inherits(Through2, Transform);

  return Through2;
});

const obj = createThrough2((options, transform, flush) => {
  const t2 = new Transform(Object.assign({ objectMode: true, highWaterMark: 16 }, options));

  t2._transform = transform;

  if (flush) {
    t2._flush = flush;
  }

  return t2;
});

module.exports = make;
module.exports.ctor = ctor;
module.exports.obj = obj;
