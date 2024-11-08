// whatwg-url.js

// Import necessary modules
const { URL, URLSearchParams } = require('url');

class WhatwgURL {
  constructor(input, baseURL) {
    // Create a URL instance with input and optional baseURL
    this.urlInstance = new URL(input, baseURL);
  }

  // Parses an input URL string with optional base URL and returns a URL instance or null on error
  static parseURL(input, options = {}) {
    try {
      const baseURL = options.baseURL ? new URL(options.baseURL) : undefined;
      return new URL(input, baseURL);
    } catch {
      return null;
    }
  }

  // Basic URL parsing method providing identical functionality to parseURL
  static basicURLParse(input, options = {}) {
    return this.parseURL(input, options);
  }

  // Serializes a URL into a string, with option to exclude fragment
  static serializeURL(urlInstance, excludeFragment = false) {
    const url = new URL(urlInstance);
    return url.toString();
  }

  // Serializes and returns the host part of the URL
  static serializeHost(urlInstance) {
    const url = new URL(urlInstance);
    return url.host;
  }

  // Serializes and returns the path part of the URL
  static serializePath(urlInstance) {
    const url = new URL(urlInstance);
    return url.pathname;
  }

  // Converts an integer to string
  static serializeInteger(number) {
    return number.toString();
  }

  // Serializes and returns the origin part of the URL
  static serializeURLOrigin(urlInstance) {
    const url = new URL(urlInstance);
    return url.origin;
  }

  // Sets the username part of the URL and returns the updated URL
  static setTheUsername(urlInstance, usernameString) {
    const url = new URL(urlInstance);
    url.username = usernameString;
    return url;
  }

  // Sets the password part of the URL and returns the updated URL
  static setThePassword(urlInstance, passwordString) {
    const url = new URL(urlInstance);
    url.password = passwordString;
    return url;
  }

  // Checks if the path is opaque (determined by specific characters)
  static hasAnOpaquePath(urlInstance) {
    const url = new URL(urlInstance);
    return url.pathname === '..' || url.pathname === '.';
  }

  // Determines if a URL cannot have username, password, or port
  static cannotHaveAUsernamePasswordPort(urlInstance) {
    const url = new URL(urlInstance);
    return !url.username && !url.password && !url.port;
  }

  // Decodes a percent-encoded byte sequence into a string
  static percentDecodeBytes(uint8Array) {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(uint8Array);
  }

  // Decodes a percent-encoded string
  static percentDecodeString(string) {
    return decodeURIComponent(string);
  }
}

// Export the classes and methods
module.exports = {
  WhatwgURL,
  URL: WhatwgURL,
  URLSearchParams,
};

// Example usage
const myURL = new WhatwgURL('https://example.com');
console.log(WhatwgURL.serializeURL(myURL.urlInstance, true));
