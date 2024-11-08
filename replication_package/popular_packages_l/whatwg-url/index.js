// whatwg-url.js

// Import necessary modules
const { URL, URLSearchParams } = require('url');
const { parse, format } = require('url');

class WhatwgURL {
  constructor(input, baseURL) {
    this.urlInstance = new URL(input, baseURL);
  }

  static parseURL(input, options = {}) {
    try {
      const baseURL = options.baseURL ? new URL(options.baseURL) : undefined;
      return new URL(input, baseURL);
    } catch {
      return null;
    }
  }

  static basicURLParse(input, options = {}) {
    try {
      const baseURL = options.baseURL ? new URL(options.baseURL) : undefined;
      const urlObj = new URL(input, baseURL);
      return urlObj;
    } catch {
      return null;
    }
  }

  static serializeURL(urlInstance, excludeFragment = false) {
    return format(urlInstance, { fragment: !excludeFragment });
  }

  static serializeHost(urlInstance) {
    return (new URL(urlInstance)).host;
  }

  static serializePath(urlInstance) {
    return (new URL(urlInstance)).pathname;
  }

  static serializeInteger(number) {
    return number.toString();
  }

  static serializeURLOrigin(urlInstance) {
    return (new URL(urlInstance)).origin;
  }

  static setTheUsername(urlInstance, usernameString) {
    const url = new URL(urlInstance);
    url.username = usernameString;
    return url;
  }

  static setThePassword(urlInstance, passwordString) {
    const url = new URL(urlInstance);
    url.password = passwordString;
    return url;
  }

  static hasAnOpaquePath(urlInstance) {
    const url = new URL(urlInstance);
    return url.pathname === '..' || url.pathname === '.';
  }

  static cannotHaveAUsernamePasswordPort(urlInstance) {
    const url = new URL(urlInstance);
    return !url.username && !url.password && !url.port;
  }

  static percentDecodeBytes(uint8Array) {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(uint8Array);
  }

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

// Development instructions provided in README specify using npm commands
