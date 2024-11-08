// cross-fetch.js
const nodeFetch = require('node-fetch');

const fetchFunc = 
  (typeof window !== 'undefined' && window.fetch) ? window.fetch.bind(window) :
  (typeof self !== 'undefined' && self.fetch) ? self.fetch.bind(self) :
  nodeFetch;

module.exports = fetchFunc;
