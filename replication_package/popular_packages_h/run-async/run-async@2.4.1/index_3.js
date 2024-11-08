'use strict';

function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

const runAsync = module.exports = (func, cb = () => {}) => () => {
  const args = arguments;

  const promise = new Promise((resolve, reject) => {
    let resolved = false;
    const wrappedResolve = (value) => {
      if (resolved) console.warn('Run-async promise already resolved.');
      resolved = true;
      resolve(value);
    };

    let rejected = false;
    const wrappedReject = (value) => {
      if (rejected) console.warn('Run-async promise already rejected.');
      rejected = true;
      reject(value);
    };

    let usingCallback = false;
    let callbackConflict = false;
    let contextEnded = false;

    const answer = func.apply({
      async: function () {
        if (contextEnded) {
          console.warn('Run-async async() called outside a valid run-async context, callback will be ignored.');
          return () => {};
        }
        if (callbackConflict) {
          console.warn('Run-async wrapped function (async) returned a promise.\nCalls to async() callback can have unexpected results.');
        }
        usingCallback = true;
        return (err, value) => err ? wrappedReject(err) : wrappedResolve(value);
      }
    }, Array.from(args));

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

  promise.then(value => cb(null, value), cb);
  
  return promise;
};

runAsync.cb = (func, cb) => runAsync(function () {
  const args = Array.from(arguments);
  if (args.length === func.length - 1) {
    args.push(this.async());
  }
  return func.apply(this, args);
}, cb);
