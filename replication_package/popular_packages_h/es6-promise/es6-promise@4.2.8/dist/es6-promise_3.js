(function (global) {
  'use strict';

  // Check if a given object is either a function or an object
  function isObjectOrFunction(x) {
    return x !== null && (typeof x === 'object' || typeof x === 'function');
  }

  // Check if provided parameter is a function
  function isFunction(x) {
    return typeof x === 'function';
  }

  // Definition of Promise constructor
  function Promise(resolver) {
    this._state = 'pending';
    this._result = undefined;
    this._subscribers = [];
    if (typeof resolver !== 'function') throw new TypeError('Promise resolver must be a function');

    try {
      resolver(value => resolve(this, value), reason => reject(this, reason));
    } catch (e) {
      reject(this, e);
    }
  }

  // Basic method of promise for chaining
  Promise.prototype.then = function (onFulfilled, onRejected) {
    const child = new Promise(() => {});
    handle(this, child, onFulfilled, onRejected);
    return child;
  };

  // Static method to instantly resolve a promise
  Promise.resolve = function (value) {
    return new Promise(resolve => resolve(value));
  };

  // Static method to instantly reject a promise
  Promise.reject = function (reason) {
    return new Promise((_, reject) => reject(reason));
  };

  // Static method to execute multiple promises concurrently
  Promise.all = function (promises) {
    return new Promise((resolve, reject) => {
      const results = [];
      let remaining = promises.length;
      if (remaining === 0) resolve([]);

      function resolver(index) {
        return value => {
          results[index] = value;
          if (--remaining === 0) resolve(results);
        };
      }

      for (let i = 0; i < promises.length; i += 1) {
        Promise.resolve(promises[i]).then(resolver(i), reject);
      }
    });
  };

  // Static method to race multiple promises
  Promise.race = function (promises) {
    return new Promise((resolve, reject) => {
      for (let i = 0; i < promises.length; i += 1) {
        Promise.resolve(promises[i]).then(resolve, reject);
      }
    });
  };

  // Function to settle a promise
  function handle(parent, child, onFulfilled, onRejected) {
    const callback = parent._state === 'fulfilled' ? onFulfilled : onRejected;
    if (!callback) {
      if (parent._state === 'fulfilled') resolve(child, parent._result);
      else reject(child, parent._result);
      return;
    }

    try {
      const result = callback(parent._result);
      resolve(child, result);
    } catch (e) {
      reject(child, e);
    }
  }

  // Resolve a promise
  function resolve(promise, value) {
    if (promise === value) throw new TypeError("A promise cannot be resolved with itself.");
    if (promise._state !== 'pending') return;
    if (isObjectOrFunction(value)) {
      try {
        const then = value.then;
        if (isFunction(then)) {
          then.call(value, v => resolve(promise, v), r => reject(promise, r));
          return;
        }
      } catch (e) {
        reject(promise, e);
        return;
      }
    }
    promise._state = 'fulfilled';
    promise._result = value;
    publish(promise);
  }

  // Reject a promise
  function reject(promise, reason) {
    if (promise._state !== 'pending') return;
    promise._state = 'rejected';
    promise._result = reason;
    publish(promise);
  }

  // Notifies all subscribers of the promise's completion
  function publish(promise) {
    const subscribers = promise._subscribers;

    subscribers.forEach(([child, onFulfilled, onRejected]) => {
      const callback = promise._state === 'fulfilled' ? onFulfilled : onRejected;
      if (!callback) {
        if (promise._state === 'fulfilled') resolve(child, promise._result);
        else reject(child, promise._result);
        return;
      }

      asap(() => {
        try {
          const result = callback(promise._result);
          resolve(child, result);
        } catch (e) {
          reject(child, e);
        }
      });
    });

    promise._subscribers.length = 0;
  }

  // Quick execution of functions with microtask
  const asap = (function() {
    if (typeof process !== 'undefined' && {}.toString.call(process) === "[object process]") {
      return fn => process.nextTick(fn);
    }
    if (typeof MutationObserver !== 'undefined') {
      const node = document.createTextNode('');
      const queue = [];
      new MutationObserver(() => {
        while (queue.length) queue.shift()();
      }).observe(node, { characterData: true });
      return fn => {
        queue.push(fn);
        node.data = 'trigger';
      };
    }
    return fn => setTimeout(fn, 0);
  })();

  // Ensure compatibility
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Promise;
  } else if (typeof define === 'function' && define.amd) {
    define(() => Promise);
  } else {
    global.Promise = Promise;
  }
})(this);
