"use strict";

// Import the createPlugin function from create-plugin.js
const createPlugin = require("./create-plugin.js").default;

// Create a plugin object using createPlugin with specified name and mode
const plugin = createPlugin({
  name: "transform-react-jsx",
  development: false
});

// Export the plugin object as the default export of this module
module.exports = plugin;
