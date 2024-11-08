class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.result = undefined;
    this.callbacks = [];

    const resolve = (value) => {
      if (this.state !== 'pending') return;
      this.state = 'fulfilled';
      this.result = value;
      this.callbacks.forEach(callback => this.handleCallback(callback));
    };

    const reject = (reason) => {
      if (this.state !== 'pending') return;
      this.state = 'rejected';
      this.result = reason;
      this.callbacks.forEach(callback => this.handleCallback(callback));
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  handleCallback(callback) {
    const handler = this.state === 'fulfilled' ? 'onFulfilled' : 'onRejected';
    callback[handler](this.result);
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const handleResult = () => {
        try {
          const result = this.state === 'fulfilled' ? onFulfilled(this.result) : onRejected(this.result);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      if (this.state === 'pending') {
        this.callbacks.push({ onFulfilled: handleResult, onRejected: handleResult });
      } else {
        handleResult();
      }
    });
  }

  static resolve(value) {
    return new MyPromise((resolve) => resolve(value));
  }

  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason));
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      let results = [];
      let completed = 0;

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(value => {
          results[index] = value;
          completed++;
          if (completed === promises.length) {
            resolve(results);
          }
        }, reject);
      });
    });
  }

  static any(promises) {
    return new MyPromise((resolve, reject) => {
      let reasons = [];
      let rejectCount = 0;

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(resolve, error => {
          reasons[index] = error;
          rejectCount++;
          if (rejectCount === promises.length) {
            reject(reasons);
          }
        });
      });
    });
  }

  static allSettled(promises) {
    return new MyPromise((resolve) => {
      let results = [];
      let settledCount = 0;

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          value => {
            results[index] = { status: 'fulfilled', value };
            settledCount++;
            if (settledCount === promises.length) {
              resolve(results);
            }
          },
          reason => {
            results[index] = { status: 'rejected', reason };
            settledCount++;
            if (settledCount === promises.length) {
              resolve(results);
            }
          }
        );
      });
    });
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach(promise => {
        MyPromise.resolve(promise).then(resolve, reject);
      });
    });
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  done(onFulfilled, onRejected) {
    this.then(onFulfilled, onRejected).catch(error => {
      setTimeout(() => { throw error; }, 0);
    });
  }

  nodeify(callback) {
    if (typeof callback !== 'function') return this;

    return this.then(
      value => process.nextTick(() => callback(null, value)),
      error => process.nextTick(() => callback(error))
    );
  }

  static denodeify(fn) {
    return function (...args) {
      return new MyPromise((resolve, reject) => {
        fn(...args, (err, ...result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result.length === 1 ? result[0] : result);
          }
        });
      });
    };
  }

  static nodeify(fn) {
    return function (...args) {
      const callback = typeof args[args.length - 1] === 'function' ? args.pop() : null;
      const promise = fn(...args);

      if (callback) {
        promise.nodeify(callback);
      } else {
        return promise;
      }
    };
  }
}

module.exports = MyPromise;
