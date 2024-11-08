// run-async.js

// Ensure Promise support
if (typeof Promise === 'undefined') {
  var Promise = require('es6-promise').Promise;
}

function runAsync(func, customAsync) {
  return function(...args) {
    const self = this;
    let err = false;

    const callback = (err, result) => {
      if (err) {
        return callback.promise.reject(err);
      }
      return callback.promise.resolve(result);
    };

    callback.promise = new Promise((resolve, reject) => {
      callback.promise = { resolve, reject };
    });

    // Define async property
    Object.defineProperty(self, 'async', {
      value: () => callback,
      enumerable: false
    });

    if (customAsync) {
      Object.defineProperty(self, customAsync, {
        value: () => callback,
        enumerable: false
      });
    }

    try {
      const result = func.apply(self, args);
      if (result && typeof result.then === 'function') {
        result.then(callback.promise.resolve, callback.promise.reject);
      } else if (!customAsync && !err && func.length < args.length + 1) {
        callback.promise.resolve(result);
      }
    } catch (error) {
      callback.promise.reject(error);
    }

    return callback.promise;
  };
}

function runAsyncCb(func) {
  return function(...args) {
    const self = this;
    const callback = typeof args[args.length - 1] === 'function' ? args.pop() : () => {};

    runAsync(func).apply(self, args)
      .then(result => callback(null, result))
      .catch(err => callback(err));
  };
}

runAsync.cb = runAsyncCb;

module.exports = runAsync;
