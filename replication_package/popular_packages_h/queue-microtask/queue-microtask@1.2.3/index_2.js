/*! queue-microtask. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
let promiseCache;

const queueMicrotaskPolyfill = (callback) => {
  if (!promiseCache) {
    promiseCache = Promise.resolve();
  }
  promiseCache
    .then(callback)
    .catch(error => setTimeout(() => { throw error; }, 0));
};

const isFunctionAvailable = (fn) => typeof fn === 'function';

const queueMicrotaskFunc = isFunctionAvailable(queueMicrotask)
  ? queueMicrotask.bind(typeof window !== 'undefined' ? window : global)
  : queueMicrotaskPolyfill;

module.exports = queueMicrotaskFunc;
