/*! queue-microtask. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
let promise;

// Check if the native 'queueMicrotask' is available
if (typeof queueMicrotask === 'function') {
  module.exports = queueMicrotask.bind(globalThis);
} else {
  // Define a custom microtask queueing mechanism using promises
  module.exports = (cb) => {
    // Lazily allocate a resolved promise if not already done
    return (promise || (promise = Promise.resolve()))
      .then(cb)
      .catch(err => setTimeout(() => { throw err; }, 0)); // Catch and asynchronously re-throw any error
  };
}
