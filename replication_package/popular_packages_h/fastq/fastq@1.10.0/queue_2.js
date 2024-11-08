'use strict';

const reusify = require('reusify');

function fastqueue(context, worker, concurrency) {
  if (typeof context === 'function') {
    concurrency = worker;
    worker = context;
    context = null;
  }

  if (concurrency < 1) {
    throw new Error('fastqueue concurrency must be greater than 1');
  }

  const cache = reusify(Task);
  let queueHead = null;
  let queueTail = null;
  let _running = 0;
  let errorHandler = null;

  const self = {
    push,
    drain: noop,
    saturated: noop,
    pause,
    paused: false,
    concurrency,
    running: getRunning,
    resume,
    idle,
    length,
    getQueue,
    unshift,
    empty: noop,
    kill,
    killAndDrain,
    error: setErrorHandler
  };

  return self;

  function getRunning() {
    return _running;
  }

  function pause() {
    self.paused = true;
  }

  function length() {
    let current = queueHead;
    let count = 0;

    while (current) {
      count++;
      current = current.next;
    }

    return count;
  }

  function getQueue() {
    const tasks = [];
    let current = queueHead;

    while (current) {
      tasks.push(current.value);
      current = current.next;
    }

    return tasks;
  }

  function resume() {
    if (!self.paused) return;
    self.paused = false;
    for (let i = 0; i < self.concurrency; i++) {
      _running++;
      release();
    }
  }

  function idle() {
    return _running === 0 && self.length() === 0;
  }

  function push(value, done) {
    const task = cache.get();

    Object.assign(task, {
      context,
      release,
      value,
      callback: done || noop,
      errorHandler
    });

    if (_running >= self.concurrency || self.paused) {
      if (queueTail) {
        queueTail.next = task;
        queueTail = task;
      } else {
        queueHead = task;
        queueTail = task;
        self.saturated();
      }
    } else {
      _running++;
      worker.call(context, task.value, task.worked);
    }
  }

  function unshift(value, done) {
    const task = cache.get();

    Object.assign(task, {
      context,
      release,
      value,
      callback: done || noop,
      errorHandler
    });

    if (_running >= self.concurrency || self.paused) {
      if (queueHead) {
        task.next = queueHead;
        queueHead = task;
      } else {
        queueHead = task;
        queueTail = task;
        self.saturated();
      }
    } else {
      _running++;
      worker.call(context, task.value, task.worked);
    }
  }

  function release(holder) {
    if (holder) cache.release(holder);
    const next = queueHead;
    if (next) {
      if (!self.paused) {
        if (queueHead === queueTail) {
          queueTail = null;
        }
        queueHead = next.next;
        next.next = null;
        worker.call(context, next.value, next.worked);
        if (!queueTail) self.empty();
      } else {
        _running--;
      }
    } else if (--_running === 0) {
      self.drain();
    }
  }

  function kill() {
    queueHead = null;
    queueTail = null;
    self.drain = noop;
  }

  function killAndDrain() {
    queueHead = null;
    queueTail = null;
    self.drain();
    self.drain = noop;
  }

  function setErrorHandler(handler) {
    errorHandler = handler;
  }
}

function noop() {}

function Task() {
  this.value = null;
  this.callback = noop;
  this.next = null;
  this.release = noop;
  this.context = null;
  this.errorHandler = null;

  const self = this;

  this.worked = function (err, result) {
    const { callback, errorHandler, value } = self;
    self.value = null;
    self.callback = noop;
    if (errorHandler) {
      errorHandler(err, value);
    }
    callback.call(self.context, err, result);
    self.release(self);
  };
}

module.exports = fastqueue;
