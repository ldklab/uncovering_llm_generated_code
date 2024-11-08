// process.js
(function(scope) {
  const process = {};
  let queue = [];
  let draining = false;
  let currentQueue;
  let queueIndex = -1;

  function cleanUpNextTick() {
    if (!draining) return;
    draining = false;
    if (currentQueue?.length) {
      queue = currentQueue.concat(queue);
    } else {
      queueIndex = -1;
    }
    if (queue.length) drainQueue();
  }

  function drainQueue() {
    if (draining) return;
    const timeout = setTimeout(cleanUpNextTick);
    draining = true;

    while (queue.length) {
      currentQueue = queue;
      queue = [];
      queueIndex = -1;
      while (++queueIndex < currentQueue.length) {
        currentQueue[queueIndex]?.run();
      }
    }

    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
  }

  process.nextTick = function(func, ...args) {
    queue.push(new Task(func, args));
    if (queue.length === 1 && !draining) {
      setTimeout(drainQueue, 0);
    }
  };

  class Task {
    constructor(func, args) {
      this.func = func;
      this.args = args;
    }

    run() {
      this.func(...this.args);
    }
  }

  process.browser = true;

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = process;
  } else {
    scope.process = process;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
