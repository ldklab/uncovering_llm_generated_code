'use strict';

function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

/**
 * Run a function synchronously or asynchronously and handle it accordingly
 *
 * @param   {Function} func  Function to run
 * @param   {Function} [cb]  Callback function to handle the return value
 * @param   {string} [proxyProperty] Property for context-sensitive callback generation
 * @return  {Function(arguments)} Executes `func`, returning a Promise or invoking callbacks.
 */
const runAsync = module.exports = (func, cb, proxyProperty = 'async') => {
  if (typeof cb === 'string') {
    proxyProperty = cb;
    cb = undefined;
  }
  cb = cb || function() {};

  return function() {
    const args = arguments;
    const originalThis = this;

    const promise = new Promise((resolve, reject) => {
      let resolved = false;
      const wrappedResolve = (value) => {
        if (resolved) console.warn('Run-async promise already resolved.');
        resolved = true;
        resolve(value);
      }

      let rejected = false;
      const wrappedReject = (value) => {
        if (rejected) console.warn('Run-async promise already rejected.');
        rejected = true;
        reject(value);
      }

      let usingCallback = false;
      let callbackConflict = false;
      let contextEnded = false;

      const doneFactory = () => {
        if (contextEnded) {
          console.warn('Run-async async() called outside of valid context, ignoring callback.');
          return () => {};
        }
        if (callbackConflict) {
          console.warn('Run-async conflict: function returned a promise and uses async callback.');
        }
        usingCallback = true;
        return (err, value) => err ? wrappedReject(err) : wrappedResolve(value);
      };

      let _this;
      if (originalThis && proxyProperty && Proxy) {
        _this = new Proxy(originalThis, {
          get(target, prop) {
            if (prop === proxyProperty) {
              if (prop in target) {
                console.warn(`${proxyProperty} property is shadowed by run-async`);
              }
              return doneFactory;
            }
            return Reflect.get(...arguments);
          },
        });
      } else {
        _this = { [proxyProperty]: doneFactory };
      }

      const result = func.apply(_this, Array.from(args));

      if (usingCallback) {
        if (isPromise(result)) {
          console.warn('Run-async function returned a promise but async callback must be executed to resolve.');
        }
      } else {
        if (isPromise(result)) {
          callbackConflict = true;
          result.then(wrappedResolve, wrappedReject);
        } else {
          wrappedResolve(result);
        }
      }
      contextEnded = true;
    });

    promise.then(cb.bind(null, null), cb);

    return promise;
  }
};

runAsync.cb = (func, cb) => {
  return runAsync(function() {
    const args = Array.from(arguments);
    if (args.length === func.length - 1) {
      args.push(this.async());
    }
    return func.apply(this, args);
  }, cb);
};
