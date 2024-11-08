"use strict";

// Mark the exports object to support ES module interoperability.
Object.defineProperty(exports, "__esModule", {
  value: true
});

// Set the default export.
exports.default = void 0;

// Import a default function or object from './create-plugin.js'.
var createPlugin = require("./create-plugin.js").default;

// Set the default export to result of the createPlugin function call.
var defaultExport = createPlugin({
  name: "transform-react-jsx",
  development: false
});

// Export this as default for use by other modules.
exports.default = defaultExport;
