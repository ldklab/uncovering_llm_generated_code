const nodeFetch = require('node-fetch');
const realFetch = nodeFetch.default || nodeFetch;

function customFetch(url, options) {
  // Convert schemaless URL to complete URL for server use
  if (url.startsWith('//')) {
    url = 'https:' + url;
  }
  return realFetch(url, options);
}

customFetch.ponyfill = true;

module.exports = customFetch;
module.exports.fetch = customFetch;
module.exports.Headers = nodeFetch.Headers;
module.exports.Request = nodeFetch.Request;
module.exports.Response = nodeFetch.Response;
module.exports.default = customFetch;
