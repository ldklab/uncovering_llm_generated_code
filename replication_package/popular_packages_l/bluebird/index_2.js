// bluebird-lite.js
class BluebirdLite {
  constructor(executor) {
    this.state = 'pending';
    this.value = null;
    this.handlers = [];
    this.cancelRequested = false;

    const resolve = (value) => {
      if (!this.cancelRequested) this.updateState('fulfilled', value);
    };

    const reject = (reason) => {
      if (!this.cancelRequested) this.updateState('rejected', reason);
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  updateState(state, value) {
    if (this.state !== 'pending') return;
    this.state = state;
    this.value = value;
    this.handlers.forEach(this.handle.bind(this));
  }

  handle(handler) {
    if (this.state === 'pending') {
      this.handlers.push(handler);
    } else {
      let cb = this.state === 'fulfilled' ? handler.onFulfilled : handler.onRejected;
      cb = cb || (this.state === 'fulfilled' ? handler.resolve : handler.reject);

      try {
        const result = (cb && cb(this.value)) || this.value;
        handler.resolve(result);
      } catch (error) {
        handler.reject(error);
      }
    }
  }

  then(onFulfilled, onRejected) {
    return new BluebirdLite((resolve, reject) => {
      this.handle({ onFulfilled, onRejected, resolve, reject });
    });
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  cancel() {
    if (this.state === 'pending') {
      this.cancelRequested = true;
      this.updateState('cancelled', 'Promise was cancelled');
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
      let fulfilledCount = 0;
      const results = [];
      if (promises.length === 0) resolve(results);

      const addResult = (index, value) => {
        results[index] = value;
        fulfilledCount += 1;
        if (fulfilledCount === promises.length) resolve(results);
      };

      promises.forEach((promise, index) => {
        promise.then(value => addResult(index, value)).catch(reject);
      });
    });
  }
}

module.exports = BluebirdLite;

// Usage example
const { log } = console;
const bluebirdLite = require('./bluebird-lite');

const promise1 = new bluebirdLite((resolve) => {
  setTimeout(() => resolve('Result 1'), 1000);
});

const promise2 = bluebirdLite.resolve('Result 2');

bluebirdLite.all([promise1, promise2]).then(results => {
  log(results); // Output: ['Result 1', 'Result 2']
}).catch(err => {
  log('Error:', err);
});
