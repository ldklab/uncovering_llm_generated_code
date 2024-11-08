// simplifiedProcess.js
(function(global) {
  const process = {};
  let queue = [];
  let draining = false;
  let currentQueue;
  let queueIndex = -1;

  function cleanUpNextTick() {
    if (!draining || !currentQueue) return;
    draining = false;
    if (currentQueue.length) {
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

    let len = queue.length;
    while (len) {
      currentQueue = queue;
      queue = [];
      while (++queueIndex < len) {
        if (currentQueue) {
          currentQueue[queueIndex].run();
        }
      }
      queueIndex = -1;
      len = queue.length;
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
      this.func.apply(null, this.args);
    }
  };

  process.browser = true;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = process;
  } else {
    global.process = process;
  }
})(typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);
