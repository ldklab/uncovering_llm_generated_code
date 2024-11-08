const nodeFetch = require('node-fetch');
const realFetch = nodeFetch.default || nodeFetch;

function fetch(url, options) {
  // If URL begins with //, prepend https: to the URL
  if (/^\/\//.test(url)) {
    url = 'https:' + url;
  }
  return realFetch.call(this, url, options);
}

fetch.ponyfill = true;

module.exports = fetch;
module.exports.fetch = fetch;
module.exports.Headers = nodeFetch.Headers;
module.exports.Request = nodeFetch.Request;
module.exports.Response = nodeFetch.Response;
module.exports.default = fetch;
