module.exports = wrappy;

function wrappy(fn, cb) {
  // If both function and callback are provided, call wrappy on the function and pass the callback.
  if (fn && cb) return wrappy(fn)(cb);
  
  // Throw an error if the provided fn is not a function.
  if (typeof fn !== 'function') {
    throw new TypeError('need wrapper function');
  }

  // Copy own properties from the original function to the wrapper function.
  Object.assign(wrapper, fn);
  
  return wrapper;

  // Define the wrapper function.
  function wrapper(...args) {
    // Call the original function with the provided arguments and save the return value.
    const ret = fn.apply(this, args);
    
    // Get the last argument which should be the callback function.
    const callback = args[args.length - 1];
    
    // If the return value is a function and different from the callback,
    // copy the callback's own properties to the return function.
    if (typeof ret === 'function' && ret !== callback) {
      Object.assign(ret, callback);
    }
    
    // Return the potentially enhanced return function.
    return ret;
  }
}
