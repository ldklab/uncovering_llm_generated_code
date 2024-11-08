// once.js

function once(func) {
  if (typeof func !== 'function') {
    throw new TypeError('Expected a function');
  }

  let called = false;
  let value;

  function wrapper() {
    if (!called) {
      called = true;
      value = func.apply(this, arguments);
    }
    return value;
  }
  
  wrapper.called = false;

  return wrapper;
}

once.proto = function() {
  Object.defineProperty(Function.prototype, 'once', {
    value: function() {
      return once(this);
    },
    configurable: true,
    writable: true,
  });
};

once.strict = function(func) {
  if (typeof func !== 'function') {
    throw new TypeError('Expected a function');
  }

  let called = false;

  function wrapper() {
    if (called) {
      throw new Error('Function called more than once');
    }
    called = true;
    return func.apply(this, arguments);
  }
  
  return wrapper;
};

module.exports = once;
