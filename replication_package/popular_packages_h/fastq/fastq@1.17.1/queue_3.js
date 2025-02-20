'use strict';

const reusify = require('reusify');

function fastqueue(context, worker, _concurrency) {
  if (typeof context === 'function') {
    _concurrency = worker;
    worker = context;
    context = null;
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
    push,
    drain: noop,
    saturated: noop,
    pause,
    paused: false,
    get concurrency() {
      return _concurrency;
    },
    set concurrency(value) {
      if (!(value >= 1)) {
        throw new Error('fastqueue concurrency must be equal to or greater than 1');
      }
      _concurrency = value;
      if (self.paused) return;
      while (queueHead && _running < _concurrency) {
        _running++;
        release();
      }
    },
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
    if (!self.paused) return;
    self.paused = false;
    if (queueHead === null) {
      _running++;
      release();
      return;
    }
    while (queueHead && _running < _concurrency) {
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

    if (_running >= _concurrency || self.paused) {
      if (queueTail) {
        queueTail.next = current;
        queueTail = current;
      } else {
        queueHead = current;
        queueTail = current;
        self.saturated();
      }
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
    current.errorHandler = errorHandler;

    if (_running >= _concurrency || self.paused) {
      if (queueHead) {
        current.next = queueHead;
        queueHead = current;
      } else {
        queueHead = current;
        queueTail = current;
        self.saturated();
      }
    } else {
      _running++;
      worker.call(context, current.value, current.worked);
    }
  }

  function release(holder) {
    if (holder) {
      cache.release(holder);
    }
    const next = queueHead;
    if (next && _running <= _concurrency) {
      if (!self.paused) {
        if (queueTail === queueHead) {
          queueTail = null;
        }
        queueHead = next.next;
        next.next = null;
        worker.call(context, next.value, next.worked);
        if (queueTail === null) {
          self.empty();
        }
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

  function error(handler) {
    errorHandler = handler;
  }
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

    this.worked = (err, result) => {
      const callback = this.callback;
      const errorHandler = this.errorHandler;
      const val = this.value;
      this.value = null;
      this.callback = noop;
      if (errorHandler) {
        errorHandler(err, val);
      }
      callback.call(this.context, err, result);
      this.release(this);
    };
  }
}

function queueAsPromised(context, worker, _concurrency) {
  if (typeof context === 'function') {
    _concurrency = worker;
    worker = context;
    context = null;
  }

  function asyncWrapper(arg, cb) {
    worker.call(this, arg)
      .then(res => cb(null, res), cb);
  }

  const queue = fastqueue(context, asyncWrapper, _concurrency);

  const pushCb = queue.push;
  const unshiftCb = queue.unshift;

  return {
    ...queue,
    push: (value) => promiseWrapper(pushCb, value),
    unshift: (value) => promiseWrapper(unshiftCb, value),
    drained
  };

  function promiseWrapper(callback, value) {
    const p = new Promise((resolve, reject) => {
      callback(value, (err, result) => {
        err ? reject(err) : resolve(result);
      });
    });

    p.catch(noop);

    return p;
  }

  function drained() {
    if (queue.idle()) {
      return Promise.resolve();
    }

    const previousDrain = queue.drain;

    return new Promise((resolve) => {
      queue.drain = () => {
        previousDrain();
        resolve();
      };
    });
  }
}

module.exports = fastqueue;
module.exports.promise = queueAsPromised;
