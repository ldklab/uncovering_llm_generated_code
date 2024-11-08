"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

// Define UUID generation and utility exports
const modules = {
  v1: require("./v1.js").default,
  v3: require("./v3.js").default,
  v4: require("./v4.js").default,
  v5: require("./v5.js").default,
  NIL: require("./nil.js").default,
  version: require("./version.js").default,
  validate: require("./validate.js").default,
  stringify: require("./stringify.js").default,
  parse: require("./parse.js").default,
};

// Export each module
for (const [key, value] of Object.entries(modules)) {
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: () => value,
  });
}
