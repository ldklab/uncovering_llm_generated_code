'use strict';

class FastQueue {
  constructor(that, worker, concurrency, usePromises = false) {
    this.that = that;
    this.worker = worker.bind(that);
    this.concurrency = concurrency;
    this.usePromises = usePromises;
    this.queue = [];
    this.workers = 0;
    this.paused = false;
    this.events = {
      drain: () => {},
      empty: () => {},
      saturated: () => {},
    };
    this.errorHandler = null;
  }

  _enqueue(task, done, enqueMethod) {
    return new Promise((resolve, reject) => {
      const callback = (err, result) => {
        if (this.errorHandler) this.errorHandler(err, task);
        if (done) done(err, result);
        err ? reject(err) : resolve(result);
      };
      this.queue[enqueMethod]({ task, callback });
      process.nextTick(() => this._process());
    });
  }

  push(task, done) {
    return this._enqueue(task, done, 'push');
  }

  unshift(task, done) {
    return this._enqueue(task, done, 'unshift');
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
    this._process();
  }

  idle() {
    return !this.workers && !this.queue.length;
  }

  length() {
    return this.queue.length;
  }

  getQueue() {
    return [...this.queue];
  }

  kill() {
    this.queue = [];
    this.events.drain = () => {};
  }

  killAndDrain() {
    this.kill();
    this.events.drain();
  }

  error(handler) {
    this.errorHandler = handler;
  }

  _process() {
    if (this.paused || this.workers >= this.concurrency) return;
    const taskObj = this.queue.shift();
    if (!taskObj) return;
    if (!this.queue.length) this.events.empty();

    this.workers++;
    if (this.workers === this.concurrency) this.events.saturated();

    const { task, callback } = taskObj;

    const done = (err, result) => {
      callback(err, result);
      this._complete();
    };

    if (this.usePromises) {
      this.worker(task).then(result => done(null, result)).catch(done);
    } else {
      this.worker(task, done);
    }
  }

  _complete() {
    this.workers--;
    if (this.idle()) this.events.drain();
    this._process();
  }
}

function fastqueue(that, worker, concurrency) {
  return new FastQueue(that, worker, concurrency);
}

fastqueue.promise = function(that, worker, concurrency) {
  return new FastQueue(that, worker, concurrency, true);
};

module.exports = fastqueue;
