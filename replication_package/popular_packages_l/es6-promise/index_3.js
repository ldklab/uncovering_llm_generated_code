// es6-promise-polyfill.js

(function (global) {
  class CustomPromise {
    constructor(executor) {
      this.state = 'pending';
      this.value = undefined;
      
      const resolve = value => this._handleResolution(() => value);
      const reject = reason => this._handleResolution(() => { throw reason; });
      
      try {
        executor(resolve, reject);
      } catch (error) {
        reject(error);
      }
    }

    _handleResolution(execFunction) {
      if (this.state !== 'pending') return;
      try {
        this.value = execFunction();
        this.state = 'fulfilled';
      } catch (error) {
        this.value = error;
        this.state = 'rejected';
      }
    }

    then(onFulfilled, onRejected) {
      return new CustomPromise((resolve, reject) => {
        if (this.state === 'fulfilled' && onFulfilled) {
          try {
            resolve(onFulfilled(this.value));
          } catch (error) {
            reject(error);
          }
        } else if (this.state === 'rejected' && onRejected) {
          try {
            resolve(onRejected(this.value));
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
      const callback = () => CustomPromise.resolve(onFinally()).then(() => this.value);
      return this.then(callback, reason => CustomPromise.resolve(onFinally()).then(() => { throw reason; }));
    }

    static polyfill() {
      if (!global.Promise) {
        global.Promise = CustomPromise;
      }
    }

    static resolve(value) {
      return new CustomPromise(resolve => resolve(value));
    }
  }

  // Auto-polyfill if required
  if (typeof window !== 'undefined') {
    CustomPromise.polyfill();
  }

  // Exporting the CustomPromise library
  if (typeof module !== 'undefined') {
    module.exports = { CustomPromise };
  }

}(typeof window !== 'undefined' ? window : global));
