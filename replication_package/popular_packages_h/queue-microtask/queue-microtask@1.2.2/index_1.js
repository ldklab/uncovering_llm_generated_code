/*! queue-microtask. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
let promise;

module.exports = (function() {
  if (typeof queueMicrotask === 'function') {
    // Use the built-in queueMicrotask if available
    return queueMicrotask.bind(globalThis);
  } else {
    // Custom implementation using a resolved Promise
    return function(cb) {
      (promise || (promise = Promise.resolve()))
        .then(cb)
        .catch(err => setTimeout(() => { throw err }, 0));
    };
  }
})();
