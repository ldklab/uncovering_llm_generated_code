// Utility function to define a property
const defineProperty = (target, name, descriptor) => Object.defineProperty(target, name, descriptor);

// Utility function to export all properties of an object
const exportProperties = (target, properties) => {
  for (const name in properties) {
    defineProperty(target, name, { get: properties[name], enumerable: true });
  }
};

// Function to copy properties from one object to another, excluding specified keys
const copyProperties = (to, from, except) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (const key of Object.getOwnPropertyNames(from)) {
      if (!(key in to) && key !== except) {
        defineProperty(to, key, {
          get: () => from[key],
          enumerable: Object.getOwnPropertyDescriptor(from, key)?.enumerable,
        });
      }
    }
  }
  return to;
};

// Function to prepare a module for CommonJS export
const toCommonJS = (mod) => copyProperties(defineProperty({}, "__esModule", { value: true }), mod);

// parseUrl functionality module
const querystringParser = require("@smithy/querystring-parser");

function parseUrl(url) {
  if (typeof url === "string") {
    return parseUrl(new URL(url));
  }

  const { hostname, pathname, port, protocol, search } = url;
  const query = search ? querystringParser.parseQueryString(search) : undefined;
  
  return {
    hostname,
    port: port ? parseInt(port) : undefined,
    protocol,
    path: pathname,
    query,
  };
}

defineProperty(parseUrl, "name", { value: "parseUrl", configurable: true });

// Module exports
const srcExports = {};
exportProperties(srcExports, { parseUrl: () => parseUrl });
module.exports = toCommonJS(srcExports);
