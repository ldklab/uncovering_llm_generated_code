(function (global) {
  class SimplePromise {
    constructor(executor) {
      this.state = 'pending';
      this.value = undefined;

      const resolve = (value) => this._settle('fulfilled', value);
      const reject = (reason) => this._settle('rejected', reason);

      try {
        executor(resolve, reject);
      } catch (error) {
        reject(error);
      }
    }

    _settle(state, value) {
      if (this.state === 'pending') {
        this.state = state;
        this.value = value;
      }
    }

    then(onFulfilled, onRejected) {
      return new SimplePromise((resolve, reject) => {
        if (this.state === 'fulfilled') {
          resolve(onFulfilled(this.value));
        } else if (this.state === 'rejected') {
          reject(onRejected(this.value));
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
      return new SimplePromise((resolve) => resolve(value));
    }

    static reject(reason) {
      return new SimplePromise((_, reject) => reject(reason));
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
    module.exports = { Promise: SimplePromise };
  }

}(typeof window !== 'undefined' ? window : global));
