'use strict';

const reusify = require('reusify');

function fastqueue(context, worker, concurrency) {
  if (typeof context === 'function') {
    concurrency = worker;
    worker = context;
    context = null;
  }

  if (!(concurrency >= 1)) {
    throw new Error('fastqueue concurrency must be equal to or greater than 1');
  }

  const cache = reusify(Task);
  let queueHead = null;
  let queueTail = null;
  let runningCount = 0;
  let errorHandler = null;

  const queue = {
    push,
    drain: noop,
    saturated: noop,
    pause,
    paused: false,

    get concurrency() {
      return concurrency;
    },
    set concurrency(value) {
      if (!(value >= 1)) {
        throw new Error('fastqueue concurrency must be equal to or greater than 1');
      }
      concurrency = value;

      if (queue.paused) return;
      while (queueHead && runningCount < concurrency) {
        runningCount++;
        release();
      }
    },

    running: () => runningCount,
    resume,
    idle: () => runningCount === 0 && queue.length() === 0,
    length,
    getQueue,
    unshift,
    empty: noop,
    kill,
    killAndDrain,
    error: setErrorHandler
  };

  return queue;

  function pause() {
    queue.paused = true;
  }

  function length() {
    let current = queueHead;
    let counter = 0;

    while (current) {
      current = current.next;
      counter++;
    }

    return counter;
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

  function resume() {
    if (!queue.paused) return;
    queue.paused = false;
    if (queueHead === null) {
      runningCount++;
      release();
      return;
    }
    while (queueHead && runningCount < concurrency) {
      runningCount++;
      release();
    }
  }

  function push(value, done) {
    const current = cache.get();

    current.context = context;
    current.release = release;
    current.value = value;
    current.callback = done || noop;
    current.errorHandler = errorHandler;

    if (runningCount >= concurrency || queue.paused) {
      if (queueTail) {
        queueTail.next = current;
        queueTail = current;
      } else {
        queueHead = current;
        queueTail = current;
        queue.saturated();
      }
    } else {
      runningCount++;
      worker.call(context, current.value, current.worked);
    }
  }

  function unshift(value, done) {
    const current = cache.get();

    current.context = context;
    current.release = release;
    current.value = value;
    current.callback = done || noop;
    current.errorHandler = errorHandler;

    if (runningCount >= concurrency || queue.paused) {
      if (queueHead) {
        current.next = queueHead;
        queueHead = current;
      } else {
        queueHead = current;
        queueTail = current;
        queue.saturated();
      }
    } else {
      runningCount++;
      worker.call(context, current.value, current.worked);
    }
  }

  function release(holder) {
    if (holder) {
      cache.release(holder);
    }
    const next = queueHead;
    if (next && runningCount <= concurrency) {
      if (!queue.paused) {
        if (queueTail === queueHead) {
          queueTail = null;
        }
        queueHead = next.next;
        next.next = null;
        worker.call(context, next.value, next.worked);
        if (queueTail === null) {
          queue.empty();
        }
      } else {
        runningCount--;
      }
    } else if (--runningCount === 0) {
      queue.drain();
    }
  }

  function kill() {
    queueHead = null;
    queueTail = null;
    queue.drain = noop;
  }

  function killAndDrain() {
    queueHead = null;
    queueTail = null;
    queue.drain();
    queue.drain = noop;
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

  this.worked = function worked(err, result) {
    const callback = self.callback;
    const errorHandler = self.errorHandler;
    const val = self.value;
    self.value = null;
    self.callback = noop;
    if (errorHandler) {
      errorHandler(err, val);
    }
    callback.call(self.context, err, result);
    self.release(self);
  }
}

function queueAsPromised(context, worker, concurrency) {
  if (typeof context === 'function') {
    concurrency = worker;
    worker = context;
    context = null;
  }

  function asyncWrapper(arg, cb) {
    worker.call(this, arg)
      .then(res => cb(null, res))
      .catch(cb);
  }

  const queue = fastqueue(context, asyncWrapper, concurrency);

  const { push: pushCb, unshift: unshiftCb } = queue;

  queue.push = value => promiseTask(pushCb, value);
  queue.unshift = value => promiseTask(unshiftCb, value);
  queue.drained = drained;

  return queue;

  function promiseTask(method, value) {
    const p = new Promise((resolve, reject) => {
      method(value, (err, result) => err ? reject(err) : resolve(result));
    });

    p.catch(noop);
    return p;
  }

  function drained() {
    if (queue.idle()) {
      return Promise.resolve();
    }

    const previousDrain = queue.drain;

    return new Promise(resolve => {
      queue.drain = function () {
        previousDrain();
        resolve();
      };
    });
  }
}

module.exports = fastqueue;
module.exports.promise = queueAsPromised;
