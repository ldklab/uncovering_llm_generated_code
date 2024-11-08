// @smithy/url-parser/index.js

class UrlParser {
  /**
   * Parses the given URL and returns its components.
   * @param {string} url - The URL to parse.
   * @returns {Object} An object containing the components of the URL.
   * @throws Will throw an error if the URL is invalid.
   */
  parse(url) {
    try {
      const urlObj = new URL(url); // Create a new URL object
      // Return an object with various components of the URL
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
      throw new Error('Invalid URL'); // Handle invalid URLs
    }
  }
}

module.exports = UrlParser;

// Example usage (not part of the package itself, could reside in a test or documentation)
// const UrlParser = require('@smithy/url-parser');
// const parser = new UrlParser();
// console.log(parser.parse('https://example.com:8080/path/name?query=string#hash'));
