// once.js

// The `once` function wraps another function to ensure it can only be executed once. 
// Subsequent calls will return the result of the first execution,
// regardless of any new arguments passed.

function once(func) {
  // Throws an error if the provided argument is not a function
  if (typeof func !== 'function') {
    throw new TypeError('Expected a function');
  }

  // State variables to track if the function has been called and the result of the function execution
  let called = false;
  let value;

  function wrapper() {
    // If the function hasn't been called, execute it, store the result and update called state
    if (!called) {
      called = true;
      value = func.apply(this, arguments);
    }
    // Return the stored result value
    return value;
  }

  // Property to track if the function has been called (not used in the current implementation)
  wrapper.called = false;

  // Return the wrapped function
  return wrapper;
}

// `once.proto` extends the Function prototype allowing any function to be executed only once
once.proto = function() {
  Object.defineProperty(Function.prototype, 'once', {
    value: function() {
      return once(this);
    },
    configurable: true,
    writable: true,
  });
};

// `once.strict` is a variant of `once` that throws an error when the function is called more than once
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

// Exporting the `once` function as a module
module.exports = once;
