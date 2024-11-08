"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// Import the createPlugin function from the create-plugin.js module with a default import
const createPlugin = require("./create-plugin.js").default;

// Export a default plugin configuration using createPlugin function
// The plugin has a name "transform-react-jsx" and it's set to not be in development mode
const transformReactJSXPlugin = createPlugin({
  name: "transform-react-jsx",
  development: false
});

exports.default = transformReactJSXPlugin;
