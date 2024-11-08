// Import necessary modules
const { URL, URLSearchParams } = require('url');

class WhatwgURL {
  constructor(input, baseURL) {
    this.urlInstance = new URL(input, baseURL);
  }

  // Parses a URL with an optional base URL, returns URL object or null on failure
  static parseURL(input, options = {}) {
    try {
      const baseURL = options.baseURL ? new URL(options.baseURL) : undefined;
      return new URL(input, baseURL);
    } catch {
      return null;
    }
  }

  // Basic URL parsing, similar to parseURL
  static basicURLParse(input, options = {}) {
    try {
      const baseURL = options.baseURL ? new URL(options.baseURL) : undefined;
      return new URL(input, baseURL);
    } catch {
      return null;
    }
  }

  // Serializes a URL object to a string, optionally excluding the fragment
  static serializeURL(urlInstance, excludeFragment = false) {
    return urlInstance.toString().split('#')[excludeFragment ? 0 : undefined];
  }

  // Returns host part of a URL
  static serializeHost(urlInstance) {
    return new URL(urlInstance).host;
  }

  // Returns path part of a URL
  static serializePath(urlInstance) {
    return new URL(urlInstance).pathname;
  }

  // Converts an integer to string format
  static serializeInteger(number) {
    return number.toString();
  }

  // Returns origin part of a URL
  static serializeURLOrigin(urlInstance) {
    return new URL(urlInstance).origin;
  }

  // Sets the username of a URL
  static setTheUsername(urlInstance, usernameString) {
    const url = new URL(urlInstance);
    url.username = usernameString;
    return url;
  }

  // Sets the password of a URL
  static setThePassword(urlInstance, passwordString) {
    const url = new URL(urlInstance);
    url.password = passwordString;
    return url;
  }

  // Checks if the URL path is opaque ('.' or '..')
  static hasAnOpaquePath(urlInstance) {
    const url = new URL(urlInstance);
    return url.pathname === '..' || url.pathname === '.';
  }

  // Checks if username, password, and port can be omitted
  static cannotHaveAUsernamePasswordPort(urlInstance) {
    const url = new URL(urlInstance);
    return !url.username && !url.password && !url.port;
  }

  // Decodes percent-encoded bytes to a string
  static percentDecodeBytes(uint8Array) {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(uint8Array);
  }

  // Decodes a percent-encoded string
  static percentDecodeString(string) {
    return decodeURIComponent(string);
  }
}

// Export the class and URLSearchParams module
module.exports = {
  WhatwgURL,
  URL: WhatwgURL,
  URLSearchParams,
};

// Example usage
const myURL = new WhatwgURL('https://example.com');
console.log(WhatwgURL.serializeURL(myURL.urlInstance, true));
