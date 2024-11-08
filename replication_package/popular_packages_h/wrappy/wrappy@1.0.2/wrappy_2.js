// Exports a function that wraps callbacks to preserve their own properties.
// The `wrappy` function takes a main function `fn` and an optional callback `cb`.
// If both `fn` and `cb` are provided, it recursively wraps `cb` using `fn`.
// This wrapper function ensures any own properties of `fn` and `cb` are retained 
// in the resulting callback.

module.exports = wrappy;

function wrappy(fn, cb) {
  if (fn && cb) return wrappy(fn)(cb);

  if (typeof fn !== 'function') {
    throw new TypeError('need wrapper function');
  }

  // Copy own properties from the original function `fn` to the wrapper
  Object.keys(fn).forEach(function(k) {
    wrapper[k] = fn[k];
  });

  return wrapper;

  function wrapper() {
    // Convert the arguments object (which is not a real array) to an actual array
    var args = Array.from(arguments);
    
    // Call the original function `fn` with all provided arguments
    var ret = fn.apply(this, args);

    // Assume the last argument is a callback function
    var cb = args[args.length - 1];

    // If the result is a function that's not the same as the original callback,
    // copy the original callback's properties to the new function
    if (typeof ret === 'function' && ret !== cb) {
      Object.keys(cb).forEach(function(k) {
        ret[k] = cb[k];
      });
    }

    return ret;
  }
}
