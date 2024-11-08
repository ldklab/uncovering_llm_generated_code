// whatwg-url.js

// Import necessary modules from Node's built-in 'url' module.
const { URL, URLSearchParams } = require('url');
const { format } = require('url');

// Define a class to handle URL operations, mimicking the WHATWG URL Standard.
class WhatwgURL {
  constructor(input, baseURL) {
    // Create a new URL instance from the given input and optional baseURL.
    this.urlInstance = new URL(input, baseURL);
  }

  // Parse a URL with optional base URL.
  static parseURL(input, options = {}) {
    try {
      const baseURL = options.baseURL ? new URL(options.baseURL) : undefined;
      // Return a new URL instance.
      return new URL(input, baseURL);
    } catch {
      // Return null if parsing fails.
      return null;
    }
  }

  // A basic parse function mimicking the parseURL functionality.
  static basicURLParse(input, options = {}) {
    try {
      const baseURL = options.baseURL ? new URL(options.baseURL) : undefined;
      return new URL(input, baseURL);
    } catch {
      return null;
    }
  }

  // Serialize a URL instance to a string, optionally excluding the fragment.
  static serializeURL(urlInstance, excludeFragment = false) {
    return format(urlInstance, { fragment: !excludeFragment });
  }

  // Get the host component of a URL instance.
  static serializeHost(urlInstance) {
    return (new URL(urlInstance)).host;
  }

  // Get the pathname component of a URL instance.
  static serializePath(urlInstance) {
    return (new URL(urlInstance)).pathname;
  }

  // Convert a number to a string representation.
  static serializeInteger(number) {
    return number.toString();
  }

  // Get the origin of a URL.
  static serializeURLOrigin(urlInstance) {
    return (new URL(urlInstance)).origin;
  }

  // Set the username of a URL instance.
  static setTheUsername(urlInstance, usernameString) {
    const url = new URL(urlInstance);
    url.username = usernameString;
    return url;
  }

  // Set the password of a URL instance.
  static setThePassword(urlInstance, passwordString) {
    const url = new URL(urlInstance);
    url.password = passwordString;
    return url;
  }

  // Check if the URL has an opaque path.
  static hasAnOpaquePath(urlInstance) {
    const url = new URL(urlInstance);
    return url.pathname === '..' || url.pathname === '.';
  }

  // Determine if the URL can contain a username, password, or port.
  static cannotHaveAUsernamePasswordPort(urlInstance) {
    const url = new URL(urlInstance);
    return !url.username && !url.password && !url.port;
  }

  // Decode a Uint8Array to a string using UTF-8 encoding.
  static percentDecodeBytes(uint8Array) {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(uint8Array);
  }

  // Decode a percent-encoded string.
  static percentDecodeString(string) {
    return decodeURIComponent(string);
  }
}

// Export the classes and functionalities for use in other modules.
module.exports = {
  WhatwgURL,
  URL: WhatwgURL,
  URLSearchParams,
};

// Example usage that showcases the functionality of the WhatwgURL class.
const myURL = new WhatwgURL('https://example.com');
console.log(WhatwgURL.serializeURL(myURL.urlInstance, true));

// Development instructions are provided in an accompanying README file, which specifies the use of npm commands.
