(function (global) {
  'use strict';

  class SimplePromise {
    constructor(executor) {
      this.state = 'pending';
      this.value = undefined;
      this.handlers = [];

      const resolve = value => this.updateResult(value, 'fulfilled');
      const reject = error => this.updateResult(error, 'rejected');

      executor(resolve, reject);
    }

    updateResult(value, state) {
      setTimeout(() => {
        if (this.state !== 'pending') return;

        this.state = state;
        this.value = value;
        
        this.handlers.forEach(({ onFulfilled, onRejected }) => {
          if (state === 'fulfilled') {
            onFulfilled(value);
          } else {
            onRejected(value);
          }
        });
      }, 0);
    }

    then(onFulfilled, onRejected) {
      return new SimplePromise((resolve, reject) => {
        this.handlers.push({
          onFulfilled: value => {
            try {
              resolve(onFulfilled ? onFulfilled(value) : value);
            } catch (error) {
              reject(error);
            }
          },
          onRejected: error => {
            try {
              reject(onRejected ? onRejected(error) : error);
            } catch (error) {
              reject(error);
            }
          }
        });
      });
    }

    catch(onRejected) {
      return this.then(null, onRejected);
    }
  }

  SimplePromise.resolve = value => new SimplePromise(resolve => resolve(value));
  SimplePromise.reject = error => new SimplePromise((_, reject) => reject(error));

  SimplePromise.all = promises => {
    return new SimplePromise((resolve, reject) => {
      const results = [];
      let completedPromises = 0;

      promises.forEach((promise, index) => {
        promise.then(value => {
          results[index] = value;
          completedPromises += 1;
          if (completedPromises === promises.length) {
            resolve(results);
          }
        }).catch(reject);
      });
    });
  };

  SimplePromise.race = promises => {
    return new SimplePromise((resolve, reject) => {
      promises.forEach(promise => {
        promise.then(resolve).catch(reject);
      });
    });
  };

  global.SimplePromise = SimplePromise;

}(typeof window !== 'undefined' ? window : global));
