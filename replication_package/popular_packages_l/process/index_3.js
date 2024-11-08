// Custom process.nextTick implementation for browsers or non-Node.js environments
(function(global) {
  var process = {
    queue: [],
    draining: false,
    currentQueue: null,
    queueIndex: -1
  };

  function cleanUpNextTick() {
    if (!process.draining || !process.currentQueue) return;
    process.draining = false;
    if (process.currentQueue.length) {
      process.queue = process.currentQueue.concat(process.queue);
    } else {
      process.queueIndex = -1;
    }
    if (process.queue.length) {
      drainQueue();
    }
  }

  function drainQueue() {
    if (process.draining) return;
    var timeout = setTimeout(cleanUpNextTick, 0);
    process.draining = true;
    var len = process.queue.length;
    
    while (len) {
      process.currentQueue = process.queue;
      process.queue = [];
      while (++process.queueIndex < len) {
        if (process.currentQueue) {
          process.currentQueue[process.queueIndex].run();
        }
      }
      process.queueIndex = -1;
      len = process.queue.length;
    }
    process.currentQueue = null;
    process.draining = false;
    clearTimeout(timeout);
  }

  process.nextTick = function(func, ...args) {
    process.queue.push(new Task(func, args));
    if (process.queue.length === 1 && !process.draining) {
      setTimeout(drainQueue, 0);
    }
  };

  function Task(func, args) {
    this.func = func;
    this.args = args;
  }
  Task.prototype.run = function() {
    this.func.apply(null, this.args);
  };

  process.browser = true;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = process;
  } else {
    global.process = process;
  }
})(typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);
