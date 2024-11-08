// queue-microtask.js

function queueMicrotask(fn) {
  const hasWindowQueueMicrotask = typeof window !== 'undefined' && typeof window.queueMicrotask === 'function';
  const hasGlobalQueueMicrotask = typeof global !== 'undefined' && typeof global.queueMicrotask === 'function';

  if (hasWindowQueueMicrotask) {
    // Use window.queueMicrotask if available
    window.queueMicrotask(fn);
  } else if (hasGlobalQueueMicrotask) {
    // Use global.queueMicrotask if available in Node.js
    global.queueMicrotask(fn);
  } else {
    // Fallback using Promise if queueMicrotask is not available
    Promise.resolve().then(fn);
  }
}

module.exports = queueMicrotask;
