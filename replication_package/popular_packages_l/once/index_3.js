// once.js

// The `once` function ensures a given function is executed only once.
// It maintains the result of the first call for later calls.
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

// The `proto` method augments Function's prototype to add an `once` method.
// This allows any function to be used via `.once()`.
once.proto = function() {
  Object.defineProperty(Function.prototype, 'once', {
    value: function() {
      return once(this);
    },
    configurable: true,
    writable: true,
  });
};

// The `strict` version of `once` throws an error if the function is called more than once.
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

// Export the `once` function as a module.
module.exports = once;
