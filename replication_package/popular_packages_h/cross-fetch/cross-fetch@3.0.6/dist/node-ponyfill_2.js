const nodeFetch = require('node-fetch');
const realFetch = nodeFetch.default || nodeFetch;

const fetch = (url, options) => {
  // Convert schemaless URIs to HTTPS URIs.
  if (url.startsWith('//')) {
    url = 'https:' + url;
  }
  
  return realFetch(url, options);
};

module.exports = fetch;
module.exports.fetch = fetch;
module.exports.Headers = nodeFetch.Headers;
module.exports.Request = nodeFetch.Request;
module.exports.Response = nodeFetch.Response;
module.exports.default = fetch;
