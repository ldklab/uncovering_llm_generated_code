// @smithy/url-parser/index.js

class UrlParser {
  /**
   * Parses the given URL and returns its components.
   * @param {string} url - The URL to parse.
   * @returns {Object} An object containing the components of the URL.
   */
  parse(url) {
    try {
      const urlObj = new URL(url);
      return {
        protocol: urlObj.protocol,
        host: urlObj.host,
        hostname: urlObj.hostname,
        port: urlObj.port,
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash,
        href: urlObj.href
      };
    } catch (error) {
      throw new Error('Invalid URL');
    }
  }
}

module.exports = UrlParser;

// The UrlParser class functionality explained:
// The UrlParser class is designed to parse a URL string into its individual components using the URL Web API.
// The parse method takes in a URL string, attempts to create a URL object from it, and then extracts and returns key components 
// like protocol, host, hostname, port, pathname, search, hash, and href in an object.
// If the URL is invalid, it throws an 'Invalid URL' error.

// Example usage (could be placed in a different file for testing or documentation purposes):
// const UrlParser = require('@smithy/url-parser');
// const parser = new UrlParser();
// console.log(parser.parse('https://example.com:8080/path/name?query=string#hash'));
