const nodeFetch = require('node-fetch');
const realFetch = nodeFetch.default || nodeFetch;

const fetch = (url, options) => {
  // Convert schemaless URIs to https on the server.
  if (/^\/\//.test(url)) {
    url = 'https:' + url;
  }
  return realFetch.call(this, url, options);
};

module.exports = fetch;
module.exports.fetch = fetch;
module.exports.Headers = nodeFetch.Headers;
module.exports.Request = nodeFetch.Request;
module.exports.Response = nodeFetch.Response;

// Export default for TypeScript consumers without esModuleInterop.
module.exports.default = fetch;
