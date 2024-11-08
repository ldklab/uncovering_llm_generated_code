"use strict";

// Import the function to create a plugin from the specified module
const createPlugin = require("./create-plugin.js").default;

// Use the imported function to create a new plugin instance with specific properties
const transformReactJSX = createPlugin({
  name: "transform-react-jsx",
  development: false
});

// Export the created plugin as the default export of the module
module.exports = transformReactJSX;

//# sourceMappingURL=index.js.map
