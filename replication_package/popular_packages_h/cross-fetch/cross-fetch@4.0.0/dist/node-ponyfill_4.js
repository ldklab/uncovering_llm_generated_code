const nodeFetch = require('node-fetch');

// Extract the default fetch from node-fetch, taking into account CommonJS import style.
const realFetch = nodeFetch.default || nodeFetch;

// Define a custom fetch function to handle schemaless URLs.
function fetch(url, options) {
  // Convert schemaless URLs to fully qualified URLs by prepending 'https:'.
  if (url.startsWith('//')) {
    url = 'https:' + url;
  }
  // Call the real fetch function with the possibly modified URL.
  return realFetch.call(this, url, options);
}

// Indicate that this is a ponyfill.
fetch.ponyfill = true;

// Export the custom fetch along with node-fetch components necessary for full fetch API support.
module.exports = exports = fetch;
exports.fetch = fetch;
exports.Headers = nodeFetch.Headers;
exports.Request = nodeFetch.Request;
exports.Response = nodeFetch.Response;

// Provide default export for compatibility with TypeScript users without esModuleInterop.
exports.default = fetch;
