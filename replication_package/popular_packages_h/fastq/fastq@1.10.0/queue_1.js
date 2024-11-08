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
    unshift,
    pause,
    resume,
    kill,
    killAndDrain,
    error,
    drain: noop,
    saturated: noop,
    empty: noop,
    paused: false,
    concurrency,
    running,
    idle,
    length,
    getQueue
  };

  return self;

  function running() {
    return _running;
  }

  function pause() {
    self.paused = true;
  }

  function resume() {
    if (!self.paused) return;
    self.paused = false;
    while (_running < self.concurrency && queueHead) {
      _running++;
      release();
    }
  }

  function kill() {
    queueHead = queueTail = null;
    self.drain = noop;
  }

  function killAndDrain() {
    queueHead = queueTail = null;
    self.drain();
    self.drain = noop;
  }

  function error(handler) {
    errorHandler = handler;
  }

  function idle() {
    return _running === 0 && self.length() === 0;
  }

  function length() {
    let current = queueHead;
    let count = 0;
    while (current) {
      current = current.next;
      count++;
    }
    return count;
  }

  function getQueue() {
    let current = queueHead;
    const tasks = [];
    while (current) {
      tasks.push(current.value);
      current = current.next;
    }
    return tasks;
  }

  function push(value, done) {
    const task = cache.get();
    task.init(context, value, done, release, errorHandler);
    if (_running === self.concurrency || self.paused) {
      if (queueTail) {
        queueTail.next = task;
        queueTail = task;
      } else {
        queueHead = queueTail = task;
        self.saturated();
      }
    } else {
      _running++;
      worker.call(context, task.value, task.worked);
    }
  }

  function unshift(value, done) {
    const task = cache.get();
    task.init(context, value, done, release, errorHandler);
    if (_running === self.concurrency || self.paused) {
      if (queueHead) {
        task.next = queueHead;
        queueHead = task;
      } else {
        queueHead = queueTail = task;
        self.saturated();
      }
    } else {
      _running++;
      worker.call(context, task.value, task.worked);
    }
  }

  function release(holder) {
    if (holder) cache.release(holder);
    if (queueHead && !self.paused) {
      const task = queueHead;
      queueHead = task.next;
      if (!queueHead) queueTail = null;
      task.next = null;
      worker.call(context, task.value, task.worked);
      if (!queueHead) self.empty();
    } else if (--_running === 0) {
      self.drain();
    }
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

  this.init = function(context, value, callback, release, errorHandler) {
    this.context = context;
    this.value = value;
    this.callback = callback || noop;
    this.release = release;
    this.errorHandler = errorHandler;
  };

  this.worked = (err, result) => {
    if (this.errorHandler) {
      this.errorHandler(err, this.value);
    }
    this.callback.call(this.context, err, result);
    this.release(this);
  };
}

module.exports = fastqueue;
