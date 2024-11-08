// bluebird-lite.js
class BluebirdLite {
  constructor(executor) {
    this.state = 'pending';
    this.value = null;
    this.handlers = [];
    this.cancelRequested = false;

    const resolve = (value) => {
      if (this.cancelRequested) return;
      this.updateState('fulfilled', value);
    };

    const reject = (reason) => {
      if (this.cancelRequested) return;
      this.updateState('rejected', reason);
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
    this.handlers.forEach((handler) => this.handle(handler));
  }

  handle(handler) {
    if (this.state === 'pending') {
      this.handlers.push(handler);
    } else {
      const cb = this.state === 'fulfilled' ? handler.onFulfilled : handler.onRejected;
      if (!cb) {
        cb = this.state === 'fulfilled' ? handler.resolve : handler.reject;
        cb(this.value);
        return;
      }
      try {
        const result = cb(this.value);
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
    return new BluebirdLite((resolve) => resolve(value));
  }

  static reject(reason) {
    return new BluebirdLite((_, reject) => reject(reason));
  }

  static all(promises) {
    return new BluebirdLite((resolve, reject) => {
      let count = 0;
      const results = [];
      if (promises.length === 0) resolve([]);

      const addResult = (i, value) => {
        results[i] = value;
        count += 1;
        if (count === promises.length) {
          resolve(results);
        }
      };

      promises.forEach((promise, i) => {
        promise.then(value => addResult(i, value))
               .catch(reject);
      });
    });
  }
}

module.exports = BluebirdLite;

// Usage example
const { log } = console;
const bluebirdLite = require('./bluebird-lite');

const promise1 = new bluebirdLite((resolve, reject) => {
  setTimeout(() => resolve('Result 1'), 1000);
});

const promise2 = bluebirdLite.resolve('Result 2');

bluebirdLite.all([promise1, promise2]).then(results => {
  log(results); // Output: ['Result 1', 'Result 2']
}).catch(err => {
  log('Error:', err);
});
