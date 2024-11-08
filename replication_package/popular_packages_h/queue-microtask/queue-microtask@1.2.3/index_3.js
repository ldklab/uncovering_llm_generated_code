/*!
 * queue-microtask. MIT License. Feross Aboukhadijeh <https://feross.org/opensource>
 */
let promise;

// Check if queueMicrotask is supported and use it if possible
const queueMicrotaskShim = typeof queueMicrotask === 'function'
  ? queueMicrotask.bind(typeof window !== 'undefined' ? window : globalThis)
  : function(cb) {
      // Use a resolved Promise to mimic queueMicrotask
      (promise || (promise = Promise.resolve()))
        .then(cb)
        .catch(err => setTimeout(() => { throw err }, 0));
    };

// Export the function
module.exports = queueMicrotaskShim;
