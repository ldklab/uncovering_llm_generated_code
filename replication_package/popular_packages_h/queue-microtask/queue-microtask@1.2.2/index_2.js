/*! queue-microtask. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
let promise;

module.exports = (function() {
  if (typeof queueMicrotask === 'function') {
    return queueMicrotask.bind(globalThis);
  } else {
    return function(cb) {
      if (!promise) {
        promise = Promise.resolve();
      }
      promise.then(cb).catch(err => {
        setTimeout(() => {
          throw err;
        }, 0);
      });
    };
  }
})();
