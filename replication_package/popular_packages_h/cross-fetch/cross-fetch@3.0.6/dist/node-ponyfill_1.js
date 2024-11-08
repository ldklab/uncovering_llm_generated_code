const { default: defaultFetch, Headers, Request, Response } = require('node-fetch');

const realFetch = defaultFetch || require('node-fetch');

const fetch = (url, options) => {
  if (url.startsWith('//')) {
    url = 'https:' + url;
  }
  return realFetch(url, options);
};

module.exports = fetch;
fetch.fetch = fetch;
fetch.Headers = Headers;
fetch.Request = Request;
fetch.Response = Response;
fetch.default = fetch;
