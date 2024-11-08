// es6-promise-rewrite.js

(function (global) {
  function noop() {}

  function resolvePromise(promise, resolvingFn) {
    try {
      const result = resolvingFn();
      fulfill(promise, result);
    } catch (error) {
      fail(promise, error);
    }
  }

  function fulfill(promise, outcome) {
    if (promise.state !== 'pending') return;
    promise.state = 'fulfilled';
    promise.value = outcome;
  }
  
  function fail(promise, error) {
    if (promise.state !== 'pending') return;
    promise.state = 'rejected';
    promise.value = error;
  }
  
  function Promise(executor) {
    this.state = 'pending';
    this.value = undefined;
    
    const instance = this;
    
    function resolve(outcome) {
      resolvePromise(instance, () => outcome);
    }
    
    function reject(error) {
      resolvePromise(instance, () => { throw error; });
    }
    
    executor(resolve, reject);
  }

  Promise.prototype.then = function(onSuccess, onFailure) {
    const instance = this;
    return new Promise((resolve, reject) => {
      if (instance.state === 'fulfilled') {
        resolve(onSuccess(instance.value));
      } else if (instance.state === 'rejected') {
        reject(onFailure(instance.value));
      }
    });
  };

  Promise.prototype.catch = function(onFailure) {
    return this.then(null, onFailure);
  };

  Promise.prototype.finally = function(onFinal) {
    return this.then(
      value => Promise.resolve(onFinal()).then(() => value),
      reason => Promise.resolve(onFinal()).then(() => { throw reason; })
    );
  };

  Promise.polyfill = function() {
    if (!global.Promise) {
      global.Promise = Promise;
    }
  };

  if (typeof window !== 'undefined') {
    Promise.polyfill();
  }
  
  if (typeof module !== 'undefined') {
    module.exports = { Promise };
  }

}(typeof window !== 'undefined' ? window : global));
