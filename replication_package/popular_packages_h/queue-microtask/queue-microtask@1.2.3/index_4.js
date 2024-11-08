/*! queue-microtask. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
let resolvedPromise;

module.exports = typeof queueMicrotask === 'function'
  ? queueMicrotask.bind(globalThis)
  : callback => {
      (resolvedPromise ||= Promise.resolve()).then(callback).catch(error => {
        setTimeout(() => { throw error; }, 0);
      });
    }
