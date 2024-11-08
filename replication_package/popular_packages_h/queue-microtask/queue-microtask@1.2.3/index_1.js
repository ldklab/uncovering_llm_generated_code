/*! queue-microtask. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
let resolvedPromise;

function queueMicrotaskPolyfill(callback) {
  if (!resolvedPromise) {
    resolvedPromise = Promise.resolve();
  }
  resolvedPromise.then(callback).catch(error => {
    setTimeout(() => { throw error; }, 0);
  });
}

const microtaskQueue = (() => {
  if (typeof queueMicrotask === 'function') {
    return queueMicrotask.bind(typeof window !== 'undefined' ? window : global);
  } else {
    return queueMicrotaskPolyfill;
  }
})();

module.exports = microtaskQueue;
