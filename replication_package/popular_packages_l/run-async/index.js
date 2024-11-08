// run-async.js

// Polyfill for Promise support if it's not natively available
if (typeof Promise === 'undefined') {
  var Promise = require('es6-promise').Promise;
}

function runAsync(func, customAsync) {
  return function() {
    var self = this;
    var args = Array.prototype.slice.call(arguments);
    var err = false;

    function callback(err, result) {
      if (err) {
        result = undefined;
        return callback.promise.reject(err);
      }
      return callback.promise.resolve(result);
    }

    Object.defineProperty(callback, 'promise', {
      value: new Promise(function (resolve, reject) {
        callback.promise = { resolve, reject };
      }),
      enumerable: false
    });

    Object.defineProperty(self, 'async', {
      value: function() {
        return callback;
      },
      enumerable: false
    });

    if (customAsync) {
      Object.defineProperty(self, customAsync, {
        value: function() {
          return callback;
        },
        enumerable: false
      });
    }

    try {
      var running = func.apply(self, args);
      if (running && running.then && typeof running.then === 'function') {
        running.then(callback.promise.resolve, callback.promise.reject);
      } else if (!customAsync && !err && func.length < args.length + 1) {
        callback.promise.resolve(running);
      }
    } catch (error) {
      callback.promise.reject(error);
    }

    return callback.promise;
  };
}

function runAsyncCb(func, callback) {
  return function() {
    var self = this;
    var args = Array.prototype.slice.call(arguments);
    var hasCallback = typeof args[args.length - 1] === 'function';

    if (hasCallback) {
      callback = args.pop();
    }

    runAsync(func).apply(self, args).then(function(result) {
      callback(null, result);
    }, callback);
  };
}

runAsync.cb = runAsyncCb;

module.exports = runAsync;
