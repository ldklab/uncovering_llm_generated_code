// queue-microtask.js

function queueMicrotask(fn) {
  const hasWindowQueueMicrotask = typeof window !== 'undefined' && typeof window.queueMicrotask === 'function';
  const hasGlobalQueueMicrotask = typeof global !== 'undefined' && typeof global.queueMicrotask === 'function';

  if (hasWindowQueueMicrotask) {
    // Use browser's 'queueMicrotask' if available
    window.queueMicrotask(fn);
  } else if (hasGlobalQueueMicrotask) {
    // Use Node.js's 'queueMicrotask' if available
    global.queueMicrotask(fn);
  } else {
    // Fallback: use Promise to queue the microtask
    Promise.resolve().then(fn);
  }
}

module.exports = queueMicrotask;
