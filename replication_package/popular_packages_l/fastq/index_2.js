'use strict';

class FastQueue {
  constructor(that, worker, concurrency, usePromises = false) {
    this.that = that;
    this.worker = worker;
    this.concurrency = concurrency;
    this.queue = [];
    this.workers = 0;
    this.paused = false;
    this.drain = () => {};
    this.empty = () => {};
    this.saturated = () => {};
    this.errorHandler = null;
    this.usePromises = usePromises;
  }

  push(task, done) {
    return this._addToQueue(task, done, 'push');
  }

  unshift(task, done) {
    return this._addToQueue(task, done, 'unshift');
  }

  _addToQueue(task, done, method) {
    return new Promise((resolve, reject) => {
      const callback = (err, result) => {
        if (this.errorHandler) this.errorHandler(err, task);
        if (done) return done(err, result);
        if (err) return reject(err);
        resolve(result);
      };

      this.queue[method]({ task, callback });
      process.nextTick(() => this._process());
    });
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
    this._process();
  }

  idle() {
    return this.workers === 0 && this.queue.length === 0;
  }

  length() {
    return this.queue.length;
  }

  getQueue() {
    return this.queue.slice();
  }

  kill() {
    this.queue = [];
    this.drain = () => {};
  }

  killAndDrain() {
    this.kill();
    this.drain();
  }

  error(handler) {
    this.errorHandler = handler;
  }

  _process() {
    if (this.paused || this.workers >= this.concurrency) return;
    const taskObj = this.queue.shift();
    if (!taskObj) return;
    if (this.queue.length === 0) this.empty();

    this.workers++;
    if (this.workers === this.concurrency) this.saturated();

    const { task, callback } = taskObj;
    const workerFn = this.worker.bind(this.that);

    if (this.usePromises) {
      workerFn(task)
        .then(result => this._finishTask(callback, null, result))
        .catch(err => this._finishTask(callback, err));
    } else {
      workerFn(task, (err, result) => this._finishTask(callback, err, result));
    }
  }

  _finishTask(callback, err, result) {
    callback(err, result);
    this.workers--;
    if (this.idle()) this.drain();
    this._process();
  }
}

function fastqueue(that, worker, concurrency) {
  return new FastQueue(that, worker, concurrency, false);
}

fastqueue.promise = function(that, worker, concurrency) {
  return new FastQueue(that, worker, concurrency, true);
};

module.exports = fastqueue;
