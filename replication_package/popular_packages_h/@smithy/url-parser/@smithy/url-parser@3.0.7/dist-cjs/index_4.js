const { parseQueryString } = require("@smithy/querystring-parser");

function parseUrl(url) {
  if (typeof url === "string") {
    return parseUrl(new URL(url));
  }
  const { hostname, pathname, port, protocol, search } = url;
  let query;
  if (search) {
    query = parseQueryString(search);
  }
  return {
    hostname,
    port: port ? parseInt(port) : undefined,
    protocol,
    path: pathname,
    query
  };
}

module.exports = {
  parseUrl
};
