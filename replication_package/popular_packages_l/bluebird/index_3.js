// bluebird-lite.js
class BluebirdLite {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.handlers = [];
    this.cancelRequested = false;

    const resolve = (value) => {
      if (!this.cancelRequested) {
        this.updateState('fulfilled', value);
      }
    };

    const reject = (reason) => {
      if (!this.cancelRequested) {
        this.updateState('rejected', reason);
      }
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
    this.handlers.forEach(handler => this.handle(handler));
  }

  handle(handler) {
    if (this.state === 'pending') {
      this.handlers.push(handler);
    } else {
      let callback = this.state === 'fulfilled' ? handler.onFulfilled : handler.onRejected;
      if (!callback) {
        callback = this.state === 'fulfilled' ? handler.resolve : handler.reject;
        return callback(this.value);
      }

      try {
        const result = callback(this.value);
        handler.resolve(result);
      } catch (error) {
        handler.reject(error);
      }
    }
  }

  then(onFulfilled, onRejected) {
    return new BluebirdLite((resolve, reject) => {
      this.handle({
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
      this.updateState('cancelled', 'Promise was cancelled');
    }
  }

  static resolve(value) {
    return new BluebirdLite(resolve => resolve(value));
  }

  static reject(reason) {
    return new BluebirdLite((_, reject) => reject(reason));
  }

  static all(promises) {
    return new BluebirdLite((resolve, reject) => {
      const results = [];
      let fulfilledCount = 0;
      if (promises.length === 0) resolve([]);

      const addResult = (index, value) => {
        results[index] = value;
        fulfilledCount += 1;
        if (fulfilledCount === promises.length) {
          resolve(results);
        }
      };

      promises.forEach((promise, index) => {
        promise.then(value => addResult(index, value))
               .catch(reject);
      });
    });
  }
}

module.exports = BluebirdLite;

// Usage example
const { log } = console;
const BluebirdLite = require('./bluebird-lite');

const promise1 = new BluebirdLite((resolve) => {
  setTimeout(() => resolve('Result 1'), 1000);
});

const promise2 = BluebirdLite.resolve('Result 2');

BluebirdLite.all([promise1, promise2]).then(results => {
  log(results); // Expected output: ['Result 1', 'Result 2']
}).catch(err => {
  log('Error:', err);
});
