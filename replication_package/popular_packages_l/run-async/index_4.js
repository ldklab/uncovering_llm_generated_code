// run-async.js

// Polyfill for Promise support if it's not natively available
if (typeof Promise === 'undefined') {
  var Promise = require('es6-promise').Promise;
}

// Main function to convert synchronous functions or callback-style asynchronous functions into Promise-based asynchronous functions
function runAsync(func, customAsync) {
  return function() {
    var self = this;
    var args = Array.prototype.slice.call(arguments);
    var err = false;

    // Define a callback function that integrates Promise resolution/rejection
    function callback(err, result) {
      if (err) {
        result = undefined;
        return callback.promise.reject(err);
      }
      return callback.promise.resolve(result);
    }

    // Set up promise-based resolution and rejection in the callback
    Object.defineProperty(callback, 'promise', {
      value: new Promise(function (resolve, reject) {
        callback.promise = { resolve, reject };
      }),
      enumerable: false
    });

    // Provide an async method that returns the callback
    Object.defineProperty(self, 'async', {
      value: function() {
        return callback;
      },
      enumerable: false
    });

    // Additionally map a custom async method if specified
    if (customAsync) {
      Object.defineProperty(self, customAsync, {
        value: function() {
          return callback;
        },
        enumerable: false
      });
    }

    try {
      // Execute the provided function and handle its result appropriately
      var running = func.apply(self, args);
      // If the result is a Promise-like object, hook it up to resolve/reject on the callback's promise
      if (running && running.then && typeof running.then === 'function') {
        running.then(callback.promise.resolve, callback.promise.reject);
      } else if (!customAsync && !err && func.length < args.length + 1) {
        // If no explicit async mechanism and no errors, resolve with the default running result
        callback.promise.resolve(running);
      }
    } catch (error) {
      // Handle exceptions by rejecting the promise
      callback.promise.reject(error);
    }

    return callback.promise;
  };
}

// Variant of runAsync that handles a callback for when resolution is achieved
function runAsyncCb(func, callback) {
  return function() {
    var self = this;
    var args = Array.prototype.slice.call(arguments);
    var hasCallback = typeof args[args.length - 1] === 'function';

    if (hasCallback) {
      // If the last argument is a callback, separate it from the rest
      callback = args.pop();
    }

    // Run the function using runAsync and pass the result to the callback
    runAsync(func).apply(self, args).then(function(result) {
      callback(null, result);
    }, callback);
  };
}

// Make the callback version accessible from runAsync
runAsync.cb = runAsyncCb;

// Export the runAsync function for external use
module.exports = runAsync;
