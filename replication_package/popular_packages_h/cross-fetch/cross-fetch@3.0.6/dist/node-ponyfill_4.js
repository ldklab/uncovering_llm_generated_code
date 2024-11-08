const nodeFetch = require('node-fetch');
const realFetch = nodeFetch.default || nodeFetch;

function fetch(url, options) {
  // If URL starts with // (schemaless), prepend https to make it complete.
  if (/^\/\//.test(url)) {
    url = 'https:' + url;
  }
  return realFetch.call(this, url, options);
}

module.exports = exports = fetch;
exports.fetch = fetch;
exports.Headers = nodeFetch.Headers;
exports.Request = nodeFetch.Request;
exports.Response = nodeFetch.Response;

// Ensure compatibility with TypeScript when esModuleInterop is not enabled.
exports.default = fetch;
