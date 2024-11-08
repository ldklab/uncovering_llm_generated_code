'use strict';

const reusify = require('reusify');

function fastqueue(context, worker, _concurrency) {
  if (typeof context === 'function') {
    [_concurrency, worker, context] = [worker, context, null];
  }

  if (!(_concurrency >= 1)) {
    throw new Error('fastqueue concurrency must be equal to or greater than 1');
  }

  const cache = reusify(Task);
  let queueHead = null;
  let queueTail = null;
  let _running = 0;
  let errorHandler = null;

  const self = {
    push, drain: noop, saturated: noop, pause, paused: false, resume, idle,
    running, length, getQueue, unshift, empty: noop, kill, killAndDrain, error,
    get concurrency() { return _concurrency; },
    set concurrency(value) {
      if (!(value >= 1)) throw new Error('fastqueue concurrency must be equal to or greater than 1');
      _concurrency = value;
      if (!self.paused) while (queueHead && _running < _concurrency) { _running++; release(); }
    }
  };

  return self;

  function running() { return _running; }
  function pause() { self.paused = true; }
  function resume() {
    if (!self.paused) return;
    self.paused = false;
    processQueue();
  }
  function idle() { return _running === 0 && self.length() === 0; }
  function length() {
    let current = queueHead, counter = 0;
    while (current) current = current.next, counter++;
    return counter;
  }
  function getQueue() {
    let current = queueHead, tasks = [];
    while (current) tasks.push(current.value), current = current.next;
    return tasks;
  }
  function push(value, done) { enqueueTask(value, done, false); }
  function unshift(value, done) { enqueueTask(value, done, true); }

  function enqueueTask(value, done, atFront) {
    const task = cache.get();
    Object.assign(task, { context, release, value, callback: done || noop, errorHandler });

    if (_running >= _concurrency || self.paused) {
      if (atFront) {
        task.next = queueHead;
        queueHead = task;
      } else {
        if (queueTail) queueTail.next = task, queueTail = task;
        else queueHead = queueTail = task, self.saturated();
      }
    } else {
      _running++;
      worker.call(context, task.value, task.worked);
    }
  }

  function release(holder) {
    if (holder) cache.release(holder);
    if (--_running === 0) self.drain();
    processQueue();
  }

  function processQueue() {
    while (queueHead && _running < _concurrency) {
      if (!self.paused) {
        const next = queueHead;
        queueHead = next.next;
        if (!queueHead) queueTail = null;
        next.next = null;
        _running++;
        worker.call(context, next.value, next.worked);
      } else break;
    }
    if (!queueHead) self.empty();
  }

  function kill() { queueHead = queueTail = null; self.drain = noop; }
  function killAndDrain() { queueHead = queueTail = null; self.drain(); self.drain = noop; }
  function error(handler) { errorHandler = handler; }
}

function noop() {}

class Task {
  constructor() {
    this.value = null;
    this.callback = noop;
    this.next = null;
    this.release = noop;
    this.context = null;
    this.errorHandler = null;
  }

  worked = (err, result) => {
    const { callback, errorHandler, value } = this;
    this.value = null;
    this.callback = noop;
    if (errorHandler) errorHandler(err, value);
    callback.call(this.context, err, result);
    this.release(this);
  }
}

function queueAsPromised(context, worker, _concurrency) {
  if (typeof context === 'function') {
    [_concurrency, worker, context] = [worker, context, null];
  }

  const asyncWrapper = (arg, cb) => {
    worker.call(this, arg)
      .then(res => cb(null, res), cb);
  };

  const queue = fastqueue(context, asyncWrapper, _concurrency);
  const { push: pushCb, unshift: unshiftCb } = queue;

  queue.push = (value) => chainPromise(pushCb, value);
  queue.unshift = (value) => chainPromise(unshiftCb, value);
  queue.drained = asyncDrained();

  return queue;

  function chainPromise(method, value) {
    return new Promise((resolve, reject) => method(value, (err, result) => {
      if (err) reject(err); else resolve(result);
    })).catch(noop);
  }

  function asyncDrained() {
    return () => queue.idle() ? Promise.resolve() : new Promise(resolve => {
      const previousDrain = queue.drain;
      queue.drain = () => { previousDrain(); resolve(); };
    });
  }
}

module.exports = fastqueue;
module.exports.promise = queueAsPromised;
