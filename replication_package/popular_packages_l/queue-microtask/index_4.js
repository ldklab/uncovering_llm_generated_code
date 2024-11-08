// queue-microtask.js

function queueMicrotask(fn) {
  const hasWindowQueueMicrotask = typeof window !== 'undefined' && typeof window.queueMicrotask === 'function';
  const hasGlobalQueueMicrotask = typeof global !== 'undefined' && typeof global.queueMicrotask === 'function';

  if (hasWindowQueueMicrotask) {
    window.queueMicrotask(fn);
  } else if (hasGlobalQueueMicrotask) {
    global.queueMicrotask(fn);
  } else {
    Promise.resolve().then(fn);
  }
}

module.exports = queueMicrotask;
