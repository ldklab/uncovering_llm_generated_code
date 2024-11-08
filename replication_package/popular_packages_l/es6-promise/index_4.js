// simple-promise.js

(function (global) {
  class SimplePromise {
    constructor(executor) {
      this.state = 'pending';
      this.value = undefined;

      const resolve = (value) => {
        if (this.state === 'pending') {
          this.state = 'fulfilled';
          this.value = value;
        }
      };

      const reject = (reason) => {
        if (this.state === 'pending') {
          this.state = 'rejected';
          this.value = reason;
        }
      };

      try {
        executor(resolve, reject);
      } catch (error) {
        reject(error);
      }
    }

    then(onFulfilled, onRejected) {
      return new SimplePromise((resolve, reject) => {
        if (this.state === 'fulfilled') {
          try {
            resolve(onFulfilled(this.value));
          } catch (error) {
            reject(error);
          }
        } else if (this.state === 'rejected') {
          try {
            reject(onRejected(this.value));
          } catch (error) {
            reject(error);
          }
        }
      });
    }

    catch(onRejected) {
      return this.then(null, onRejected);
    }

    finally(onFinally) {
      return this.then(
        value => SimplePromise.resolve(onFinally()).then(() => value),
        reason => SimplePromise.resolve(onFinally()).then(() => { throw reason; })
      );
    }

    static resolve(value) {
      return new SimplePromise(resolve => resolve(value));
    }

    static polyfill() {
      if (!global.Promise) {
        global.Promise = SimplePromise;
      }
    }
  }

  if (typeof window !== 'undefined') {
    SimplePromise.polyfill();
  }

  if (typeof module !== 'undefined') {
    module.exports = { SimplePromise };
  }
}(typeof window !== 'undefined' ? window : global));
