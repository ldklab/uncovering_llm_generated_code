// es6-promise.js

(function (global) {
  function noop() {}

  function resolvePromise(promise, resolvingFunction) {
    // simulate resolution of a Promise
    try {
      let result = resolvingFunction();
      resolve(promise, result);
    } catch (error) {
      reject(promise, error);
    }
  }

  function resolve(promise, value) {
    if (promise.state !== 'pending') return;
    promise.state = 'fulfilled';
    promise.value = value;
  }
  
  function reject(promise, reason) {
    if (promise.state !== 'pending') return;
    promise.state = 'rejected';
    promise.value = reason;
  }
  
  function Promise(executor) {
    this.state = 'pending';
    this.value = undefined;
    
    const self = this;
    
    function resolve(value) {
      resolvePromise(self, function () { return value; });
    }
    
    function reject(reason) {
      resolvePromise(self, function () { throw reason; });
    }
    
    executor(resolve, reject);
  }

  Promise.prototype.then = function(onFulfilled, onRejected) {
    // further chaining logic
    var self = this;
    return new Promise(function (resolve, reject) {
      if (self.state === 'fulfilled') {
        resolve(onFulfilled(self.value));
      } else if (self.state === 'rejected') {
        reject(onRejected(self.value));
      }
    });
  };

  Promise.prototype['catch'] = function(onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype['finally'] = function(onFinally) {
    return this.then(
      value => Promise.resolve(onFinally()).then(() => value),
      reason => Promise.resolve(onFinally()).then(() => { throw reason; })
    );
  };

  Promise.polyfill = function() {
    if (!global.Promise) {
      global.Promise = Promise;
    }
  };

  // Auto-polyfill if required
  if (typeof window !== 'undefined') {
    Promise.polyfill();
  }
  
  // Exporting the Promise library
  if (typeof module !== 'undefined') {
    module.exports = { Promise };
  }

}(typeof window !== 'undefined' ? window : global));
