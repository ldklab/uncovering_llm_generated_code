// cross-fetch.js
const nodeFetch = require('node-fetch');

let fetchFunc;

// Check if running in a browser environment
if (typeof window !== 'undefined' && window.fetch) {
  fetchFunc = window.fetch.bind(window);
} 
// Check if running in a web worker environment
else if (typeof self !== 'undefined' && self.fetch) {
  fetchFunc = self.fetch.bind(self);
} 
// Otherwise, assume Node.js environment and use node-fetch
else {
  fetchFunc = nodeFetch;
}

module.exports = fetchFunc;
