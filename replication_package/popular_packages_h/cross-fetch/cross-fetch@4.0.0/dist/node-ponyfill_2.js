const nodeFetch = require('node-fetch');
const { default: realFetch, Headers, Request, Response } = nodeFetch;

function customFetch(url, options) {
  // Append 'https:' to schemaless URIs for consistency across environments.
  if (url.startsWith('//')) {
    url = 'https:' + url;
  }
  return realFetch.call(this, url, options);
}

customFetch.ponyfill = true;

module.exports = customFetch;
module.exports.fetch = customFetch;
module.exports.Headers = Headers;
module.exports.Request = Request;
module.exports.Response = Response;
module.exports.default = customFetch;
