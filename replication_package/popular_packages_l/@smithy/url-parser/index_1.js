// url-parser.js

class UrlParser {
  /**
   * Parses the given URL and returns its components.
   * @param {string} url - The URL to parse.
   * @returns {Object} An object containing the components of the URL.
   * @throws Will throw an error if the URL is invalid.
   */
  parse(url) {
    try {
      const parsedUrl = new URL(url);
      return {
        protocol: parsedUrl.protocol,
        host: parsedUrl.host,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        pathname: parsedUrl.pathname,
        search: parsedUrl.search,
        hash: parsedUrl.hash,
        href: parsedUrl.href
      };
    } catch {
      throw new Error('Invalid URL');
    }
  }
}

module.exports = UrlParser;

// Example usage
// const UrlParser = require('./url-parser');
// const parser = new UrlParser();
// console.log(parser.parse('https://example.com:8080/path/name?query=string#hash'));
