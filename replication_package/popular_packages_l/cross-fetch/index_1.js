// cross-fetch.js

const nodeFetch = require('node-fetch');

const fetchFunc = (() => {
  if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
    // In a browser environment, use the native fetch
    return window.fetch.bind(window);
  } 
  if (typeof self !== 'undefined' && typeof self.fetch === 'function') {
    // In a worker environment, use the worker's fetch
    return self.fetch.bind(self);
  }
  // In Node.js environment, use the node-fetch library
  return nodeFetch;
})();

module.exports = fetchFunc;
