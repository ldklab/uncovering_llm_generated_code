'use strict';

const reusify = require('reusify');

function fastqueue(context, worker, concurrency) {
  if (typeof context === 'function') {
    [context, worker, concurrency] = [null, context, worker];
  }

  if (concurrency < 1) {
    throw new Error('fastqueue concurrency must be greater than 1');
  }

  const cache = reusify(Task);
  let queueHead = null, queueTail = null, _running = 0, errorHandler = null;

  const self = {
    push,
    drain: noop,
    saturated: noop,
    pause,
    paused: false,
    concurrency,
    running,
    resume,
    idle,
    length,
    getQueue,
    unshift,
    empty: noop,
    kill,
    killAndDrain,
    error
  };

  return self;

  function running() {
    return _running;
  }

  function pause() {
    self.paused = true;
  }

  function length() {
    let current = queueHead, counter = 0;
    while (current) {
      current = current.next;
      counter++;
    }
    return counter;
  }

  function getQueue() {
    let current = queueHead, tasks = [];
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
    const current = cache.get();
    current.context = context;
    current.release = release;
    current.value = value;
    current.callback = done || noop;
    current.errorHandler = errorHandler;

    if (_running === self.concurrency || self.paused) {
      queueTail ? (queueTail.next = current) : (queueHead = current, self.saturated());
      queueTail = current;
    } else {
      _running++;
      worker.call(context, current.value, current.worked);
    }
  }

  function unshift(value, done) {
    const current = cache.get();
    current.context = context;
    current.release = release;
    current.value = value;
    current.callback = done || noop;

    if (_running === self.concurrency || self.paused) {
      current.next = queueHead;
      queueHead ? (queueHead = current) : (queueTail = current, self.saturated());
      queueHead = current;
    } else {
      _running++;
      worker.call(context, current.value, current.worked);
    }
  }

  function release(holder) {
    if (holder) cache.release(holder);
    const next = queueHead;
    if (next && !self.paused) {
      !_running-- && queueTail === queueHead && (queueTail = null);
      queueHead = next.next;
      next.next = null;
      worker.call(context, next.value, next.worked);
      !queueTail && self.empty();
    } else if (!self.paused && --_running === 0) {
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

  function error(handler) {
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
  
  this.worked = function worked(err, result) {
    const { callback, errorHandler, value } = self;
    self.value = self.callback = null;
    errorHandler && errorHandler(err, value);
    callback.call(self.context, err, result);
    self.release(self);
  }
}

module.exports = fastqueue;
