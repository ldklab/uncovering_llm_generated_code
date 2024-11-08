// bluebird-lite-rewritten.js
class BluebirdLite {
  constructor(executor) {
    this.state = 'pending';
    this.value = null;
    this.handlers = [];
    this.cancelRequested = false;

    const resolve = (value) => {
      if (!this.cancelRequested) this._transition('fulfilled', value);
    };

    const reject = (reason) => {
      if (!this.cancelRequested) this._transition('rejected', reason);
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  _transition(state, value) {
    if (this.state === 'pending') {
      this.state = state;
      this.value = value;
      this.handlers.forEach(this._handle, this);
    }
  }

  _handle(handler) {
    const cb = this.state === 'fulfilled' ? handler.onFulfilled : handler.onRejected;
    
    if (!cb) {
      if (this.state === 'fulfilled') handler.resolve(this.value);
      else handler.reject(this.value);
      return;
    }

    try {
      const result = cb(this.value);
      handler.resolve(result);
    } catch (error) {
      handler.reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    return new BluebirdLite((resolve, reject) => {
      this._handle({
        onFulfilled,
        onRejected,
        resolve,
        reject,
      });
    });
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  cancel() {
    if (this.state === 'pending') {
      this.cancelRequested = true;
      this._transition('cancelled', 'Promise was cancelled');
    }
  }

  static resolve(value) {
    return new BluebirdLite((resolve) => resolve(value));
  }

  static reject(reason) {
    return new BluebirdLite((_, reject) => reject(reason));
  }

  static all(promises) {
    return new BluebirdLite((resolve, reject) => {
      let resolvedCount = 0;
      const results = new Array(promises.length);

      if (promises.length === 0) return resolve([]);

      promises.forEach((promise, i) => {
        promise.then((value) => {
          results[i] = value;
          resolvedCount++;
          if (resolvedCount === promises.length) resolve(results);
        }).catch(reject);
      });
    });
  }
}

module.exports = BluebirdLite;

// Usage example
const { log } = console;
const BluebirdLite = require('./bluebird-lite-rewritten');

const promise1 = new BluebirdLite((resolve) => {
  setTimeout(() => resolve('Result 1'), 1000);
});

const promise2 = BluebirdLite.resolve('Result 2');

BluebirdLite.all([promise1, promise2]).then((results) => {
  log(results); // Output: ['Result 1', 'Result 2']
}).catch((err) => {
  log('Error:', err);
});
