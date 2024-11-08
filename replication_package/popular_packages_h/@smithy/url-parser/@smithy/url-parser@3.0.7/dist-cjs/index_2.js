var defProp = Object.defineProperty;
var getOwnPropDesc = Object.getOwnPropertyDescriptor;
var getOwnPropNames = Object.getOwnPropertyNames;
var hasOwnProp = Object.prototype.hasOwnProperty;

// Set the name property of a function
var setName = (target, value) => defProp(target, "name", { value, configurable: true });

// Export functions or values from a module
var exportModule = (target, all) => {
  for (var name in all)
    defProp(target, name, { get: all[name], enumerable: true });
};

// Copy properties from one object to another, with options
var copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of getOwnPropNames(from))
      if (!hasOwnProp.call(to, key) && key !== except)
        defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  return to;
};

// Convert a module to a CommonJS-compatible format
var toCommonJSModule = (mod) => copyProps(defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var exports = {};
exportModule(exports, {
  parseUrl: () => parseUrl
});
module.exports = toCommonJSModule(exports);

// Import necessary function
var querystringParser = require("@smithy/querystring-parser");

// Define the parseUrl function
var parseUrl = setName((url) => {
  if (typeof url === "string") {
    return parseUrl(new URL(url));
  }
  const { hostname, pathname, port, protocol, search } = url;
  let query;
  if (search) {
    query = querystringParser.parseQueryString(search);
  }
  return {
    hostname,
    port: port ? parseInt(port) : void 0,
    protocol,
    path: pathname,
    query
  };
}, "parseUrl");

// Export CommonJS module
0 && (module.exports = { parseUrl });
