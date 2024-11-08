'use strict';

const reusify = require('reusify');

class Task {
  constructor() {
    this.value = null;
    this.callback = () => {};
    this.next = null;
    this.release = () => {};
    this.context = null;
    this.errorHandler = null;
    
    this.worked = (err, result) => {
      const callback = this.callback;
      const errorHandler = this.errorHandler;
      const val = this.value;
      this.reset();
      if (this.errorHandler) errorHandler(err, val);
      callback.call(this.context, err, result);
      this.release(this);
    };
  }

  reset() {
    this.value = null;
    this.callback = () => {};
  }
}

function fastqueue(context, worker, concurrency) {
  if (typeof context === 'function') {
    concurrency = worker;
    worker = context;
    context = null;
  }

  if (concurrency < 1) throw new Error('Concurrency must be at least 1');

  const cache = reusify(Task);

  let queueHead = null;
  let queueTail = null;
  let running = 0;
  let errorHandler = null;
  let paused = false;

  const queue = {
    push,
    unshift,
    length,
    resume,
    pause,
    get concurrency() {
      return concurrency;
    },
    set concurrency(value) {
      if (value < 1) throw new Error('Concurrency must be at least 1');
      concurrency = value;
      attemptRelease();
    },
    running: () => running,
    idle: () => running === 0 && queue.length() === 0,
    drained: () => new Promise(resolve => {
      if (queue.idle()) {
        resolve();
      } else {
        queue.drain = () => { resolve(); };
      }
    }),
    drain: () => {},
    saturated: () => {},
    empty: () => {},
    kill: () => { queueHead = queueTail = null; queue.drain = () => {}; },
    killAndDrain: () => {
      queue.kill();
      queue.drain();
      queue.drain = () => {};
    },
    error: handler => { errorHandler = handler; },
  };

  function push(value, done) {
    addTask(value, done, tail => {
      if (queueTail) {
        queueTail.next = tail;
        queueTail = tail;
      } else {
        queueHead = queueTail = tail;
        queue.saturated();
      }
    });
  }

  function unshift(value, done) {
    addTask(value, done, head => {
      if (queueHead) {
        head.next = queueHead;
        queueHead = head;
      } else {
        queueHead = queueTail = head;
        queue.saturated();
      }
    });
  }

  function addTask(value, done, addToQueue) {
    const current = cache.get();
    Object.assign(current, {
      context,
      release: releaseTask,
      value,
      callback: done || (() => {}),
      errorHandler
    });

    if (running >= concurrency || paused) {
      addToQueue(current);
    } else {
      running++;
      worker.call(context, current.value, current.worked);
    }
  }

  function releaseTask(holder) {
    if (holder) cache.release(holder);
    const next = queueHead;
    if (next) {
      if (!paused) {
        if (queueTail === queueHead) queueTail = null;
        queueHead = next.next;
        next.next = null;
        worker.call(context, next.value, next.worked);
        if (!queueTail) queue.empty();
      } else {
        running--;
      }
    } else if (--running === 0) {
      queue.drain();
    }
  }

  function attemptRelease() {
    if (!paused) {
      while (queueHead && running < concurrency) {
        running++;
        releaseTask();
      }
    }
  }

  function pause() {
    paused = true;
  }

  function resume() {
    if (!paused) return;
    paused = false;
    if (queueHead === null) {
      running++;
      releaseTask();
      return;
    }
    attemptRelease();
  }

  function length() {
    let current = queueHead, counter = 0;
    while (current) {
      current = current.next;
      counter++;
    }
    return counter;
  }

  return queue;
}

function queueAsPromised(context, worker, concurrency) {
  if (typeof context === 'function') {
    concurrency = worker;
    worker = context;
    context = null;
  }

  const asyncWrapper = (arg, cb) => {
    worker.call(context, arg)
      .then(res => cb(null, res))
      .catch(cb);
  };

  const queue = fastqueue(context, asyncWrapper, concurrency);

  queue.push = promisify(queue.push);
  queue.unshift = promisify(queue.unshift);

  function promisify(fn) {
    return function(value) {
      return new Promise((resolve, reject) => {
        fn(value, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      }).catch(() => {});
    };
  }

  return queue;
}

module.exports = fastqueue;
module.exports.promise = queueAsPromised;
