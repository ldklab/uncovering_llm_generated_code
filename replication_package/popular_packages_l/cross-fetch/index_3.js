// cross-fetch.js
const nodeFetch = require('node-fetch');

let fetchFunc;

// Determine the appropriate fetch function depending on the environment
if (typeof window !== 'undefined' && window.fetch) {
  // If the code is running in a browser, use the browser's native fetch function
  fetchFunc = window.fetch.bind(window);
} else if (typeof self !== 'undefined' && self.fetch) {
  // If the code is running in a web worker environment, use the worker's fetch function
  fetchFunc = self.fetch.bind(self);
} else {
  // If the code is running in a Node.js environment, use the fetch function from the node-fetch library
  fetchFunc = nodeFetch;
}

// Export the determined fetch function
module.exports = fetchFunc;
