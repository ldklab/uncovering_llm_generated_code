'use strict';

function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

var runAsync = module.exports = function (func, cb, proxyProperty = 'async') {
  if (typeof cb === 'string') {
    proxyProperty = cb;
    cb = undefined;
  }
  cb = cb || function () {};

  return function () {
    var args = arguments;
    var originalThis = this;

    var promise = new Promise(function (resolve, reject) {
      var resolved = false;
      const wrappedResolve = function (value) {
        if (resolved) {
          console.warn('Run-async promise already resolved.');
        }
        resolved = true;
        resolve(value);
      };

      var rejected = false;
      const wrappedReject = function (value) {
        if (rejected) {
          console.warn('Run-async promise already rejected.');
        }
        rejected = true;
        reject(value);
      };

      var usingCallback = false;
      var callbackConflict = false;
      var contextEnded = false;

      const doneFactory = function () {
        if (contextEnded) {
          console.warn('Run-async async() called outside a valid run-async context, callback will be ignored.');
          return function() {};
        }
        if (callbackConflict) {
          console.warn('Run-async wrapped function (async) returned a promise.\nCalls to async() callback can have unexpected results.');
        }
        usingCallback = true;
        return function (err, value) {
          if (err) {
            wrappedReject(err);
          } else {
            wrappedResolve(value);
          }
        };
      };

      var _this = originalThis && proxyProperty && Proxy ? 
        new Proxy(originalThis, {
          get(target, prop) {
            if (prop === proxyProperty) {
              if (prop in target) {
                console.warn(`${proxyProperty} property is being shadowed by run-sync`);
              }
              return doneFactory;
            }
            return Reflect.get(...arguments);
          },
        }) : 
        { [proxyProperty]: doneFactory };

      var answer = func.apply(_this, Array.prototype.slice.call(args));

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

    promise.then(cb.bind(null, null), cb);

    return promise;
  };
};

runAsync.cb = function (func, cb) {
  return runAsync(function () {
    var args = Array.prototype.slice.call(arguments);
    if (args.length === func.length - 1) {
      args.push(this.async());
    }
    return func.apply(this, args);
  }, cb);
};
