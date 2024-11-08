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

  return wrapper;
}

// Adds a method to Function prototype that returns a new function only callable once
once.proto = function() {
  Object.defineProperty(Function.prototype, 'once', {
    value: function() {
      return once(this);
    },
    configurable: true,
    writable: true,
  });
};

// Creates a version of a function that throws an error if called more than once
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
