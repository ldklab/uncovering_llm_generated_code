'use strict';

// Helper function to check whether an object is a Promise
function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

// Main function that returns a function to run another function asynchronously or synchronously
var runAsync = module.exports = function (func, cb) {
  cb = cb || function () {}; // Default to a no-op if no callback provided

  return function () {
    var args = arguments; // Arguments to pass to 'func'

    var promise = new Promise(function (resolve, reject) {
      var resolved = false, rejected = false, usingCallback = false, callbackConflict = false, contextEnded = false;

      const wrappedResolve = function (value) {
        if (resolved) console.warn('Run-async promise already resolved.');
        resolved = true;
        resolve(value);
      }

      const wrappedReject = function (value) {
        if (rejected) console.warn('Run-async promise already rejected.');
        rejected = true;
        reject(value);
      }

      var answer = func.apply({
        async: function () {
          if (contextEnded) {
            console.warn('Run-async async() called outside a valid run-async context, callback will be ignored.');
            return function() {};
          }
          if (callbackConflict) {
            console.warn('Run-async wrapped function (async) returned a promise.\nCalls to async() callback can have unexpected results.');
          }
          usingCallback = true;
          return function (err, value) {
            if (err) wrappedReject(err);
            else wrappedResolve(value);
          };
        }
      }, Array.prototype.slice.call(args));

      if (usingCallback) {
        if (isPromise(answer)) {
          console.warn('Run-async wrapped function (sync) returned a promise but async() callback must be executed to resolve.');
        }
      } else {
        if (isPromise(answer)) {
          callbackConflict = true;
          answer.then(wrappedResolve, wrappedReject);
        } else {
          wrappedResolve(answer);
        }
      }
      contextEnded = true;
    });

    promise.then(cb.bind(null, null), cb); // Call the callback with (null, result) on resolve, else call on reject

    return promise;
  }
};

// Helper to run a function with a callback style
runAsync.cb = function (func, cb) {
  return runAsync(function () {
    var args = Array.prototype.slice.call(arguments);
    if (args.length === func.length - 1) {
      args.push(this.async()); // Ensures the async callback is inserted if needed
    }
    return func.apply(this, args); // Call the function with potential async callback included
  }, cb);
};
