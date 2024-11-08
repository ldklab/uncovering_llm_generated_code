// queue-microtask.js

function queueMicrotask(fn) {
  const environment = typeof window !== 'undefined' ? window : global;
  
  if (typeof environment.queueMicrotask === 'function') {
    // Use 'queueMicrotask' if it's supported in the current environment
    environment.queueMicrotask(fn);
  } else {
    // Fallback to using Promise if 'queueMicrotask' is not available
    Promise.resolve().then(fn);
  }
}

module.exports = queueMicrotask;
