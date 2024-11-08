/*! queue-microtask. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
let resolvedPromise;

module.exports = (() => {
  if (typeof queueMicrotask === 'function') {
    return queueMicrotask.bind(globalThis);
  } else {
    return function(callback) {
      if (!resolvedPromise) {
        resolvedPromise = Promise.resolve();
      }
      resolvedPromise
        .then(callback)
        .catch(error => setTimeout(() => { throw error; }, 0));
    };
  }
})();
