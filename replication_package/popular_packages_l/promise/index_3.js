class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.result = undefined;
    this.callbacks = [];

    const resolve = (value) => {
      if (this.state !== 'pending') return;
      this.state = 'fulfilled';
      this.result = value;
      this.callbacks.forEach(cb => this.handleCallback(cb));
    };

    const reject = (reason) => {
      if (this.state !== 'pending') return;
      this.state = 'rejected';
      this.result = reason;
      this.callbacks.forEach(cb => this.handleCallback(cb));
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  handleCallback(callback) {
    const cb = this.state === 'fulfilled' ? callback.onFulfilled : callback.onRejected;
    cb(this.result);
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const handleCallback = () => {
        try {
          const result = this.state === 'fulfilled' ? onFulfilled(this.result) : onRejected(this.result);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      if (this.state === 'pending') {
        this.callbacks.push({ onFulfilled: handleCallback, onRejected: handleCallback });
      } else {
        handleCallback();
      }
    });
  }

  static resolve(value) {
    return new MyPromise(resolve => resolve(value));
  }

  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason));
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const results = [];
      let count = 0;

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(value => {
          results[index] = value;
          count++;
          if (count === promises.length) resolve(results);
        }).catch(reject);
      });
    });
  }

  static any(promises) {
    return new MyPromise((resolve, reject) => {
      const rejections = [];
      let count = 0;

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(resolve).catch(err => {
          rejections[index] = err;
          count++;
          if (count === promises.length) reject(rejections);
        });
      });
    });
  }

  static allSettled(promises) {
    return new MyPromise(resolve => {
      const results = [];
      let count = 0;

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise)
          .then(value => results[index] = { status: 'fulfilled', value })
          .catch(reason => results[index] = { status: 'rejected', reason })
          .finally(() => {
            count++;
            if (count === promises.length) resolve(results);
          });
      });
    });
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach(promise => MyPromise.resolve(promise).then(resolve, reject));
    });
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  done(onFulfilled, onRejected) {
    this.then(onFulfilled, onRejected).catch(err => setTimeout(() => { throw err; }, 0));
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
        fn(...args, (err, ...results) => {
          if (err) return reject(err);
          resolve(results.length === 1 ? results[0] : results);
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
