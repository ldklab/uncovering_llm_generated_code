// once.js

// The 'once' function ensures that a provided function can only be executed once.
// Subsequent calls will return the result from the first call.
function once(func) {
  if (typeof func !== 'function') {
    throw new TypeError('Expected a function');
  }

  let called = false;
  let value;

  // This 'wrapper' function is the actual function that will be executed in place
  // of the original one. It checks if the function has already been called and
  // stores the result of the first invocation to return for later calls.
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

// Augments Function.prototype to add an 'once' method, enabling
// any function to call its 'once' method to be wrapped the same way.
once.proto = function() {
  Object.defineProperty(Function.prototype, 'once', {
    value: function() {
      return once(this);
    },
    configurable: true,
    writable: true,
  });
};

// The 'strict' version of 'once' throws an error if the function is called more than once.
once.strict = function(func) {
  if (typeof func !== 'function') {
    throw new TypeError('Expected a function');
  }

  let called = false;

  // This 'wrapper' function raises an error on subsequent calls
  // rather than returning the result of the initial call.
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
