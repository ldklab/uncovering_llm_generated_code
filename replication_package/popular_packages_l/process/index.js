// process.js
(function(global) {
  var process = {};
  var queue = [];
  var draining = false;
  var currentQueue;
  var queueIndex = -1;

  function cleanUpNextTick() {
    if (!draining || !currentQueue) {
      return;
    }
    draining = false;
    if (currentQueue.length) {
      queue = currentQueue.concat(queue);
    } else {
      queueIndex = -1;
    }
    if (queue.length) {
      drainQueue();
    }
  }

  function drainQueue() {
    if (draining) {
      return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
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

  process.nextTick = function(func) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
      for (var i = 1; i < arguments.length; i++) {
        args[i - 1] = arguments[i];
      }
    }
    queue.push(new Task(func, args));
    if (queue.length === 1 && !draining) {
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
