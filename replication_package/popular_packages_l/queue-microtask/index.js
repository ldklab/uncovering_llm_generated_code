// queue-microtask.js

function queueMicrotask(fn) {
  if (typeof window !== 'undefined' && typeof window.queueMicrotask === 'function') {
    // If 'queueMicrotask' is supported in the environment, use it
    window.queueMicrotask(fn);
  } else if (typeof global !== 'undefined' && typeof global.queueMicrotask === 'function') {
    // If 'queueMicrotask' is supported in Node.js, use it
    global.queueMicrotask(fn);
  } else {
    // Fallback to using Promise for environments without 'queueMicrotask'
    Promise.resolve().then(fn);
  }
}

module.exports = queueMicrotask;
