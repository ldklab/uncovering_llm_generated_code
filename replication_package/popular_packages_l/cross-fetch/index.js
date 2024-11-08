// cross-fetch.js
const nodeFetch = require('node-fetch');

let fetchFunc;

if (typeof window !== 'undefined' && window.fetch) {
  // In a browser environment, use the native fetch
  fetchFunc = window.fetch.bind(window);
} else if (typeof self !== 'undefined' && self.fetch) {
  // In a worker environment, use the worker's fetch
  fetchFunc = self.fetch.bind(self);
} else {
  // In Node.js environment, use the node-fetch library
  fetchFunc = nodeFetch;
}

module.exports = fetchFunc;
