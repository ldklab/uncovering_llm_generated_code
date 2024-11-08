// index.js
const resolve = require('resolve');

function nodeResolver(customOptions = {}) {
  // Set default options for resolving modules
  const defaultOptions = {
    extensions: ['.js'], // Default file extension to resolve
    paths: [], // An array for additional lookup paths
    moduleDirectory: ['node_modules'], // Standard module directory
  };

  // Merge custom options with the default settings
  const options = {
    ...defaultOptions,
    ...customOptions,
  };

  return {
    interfaceVersion: 2,
    resolve(source, file, config) {
      const opts = {
        ...options,
        basedir: file ? file.substring(0, file.lastIndexOf('/')) : process.cwd(), // Base directory for resolution
      };

      try {
        // Attempt to resolve the module synchronously
        return {
          found: true,
          path: resolve.sync(source, opts),
        };
      } catch (err) {
        // If resolution fails, indicate module not found
        return {
          found: false,
        };
      }
    },
  };
}

// Export the nodeResolver function
module.exports = { nodeResolver };

// package.json
{
  "name": "eslint-import-resolver-node",
  "version": "1.0.0",
  "description": "Node-style module resolution plugin for eslint-plugin-import.",
  "main": "index.js",
  "keywords": [
    "eslint",
    "import",
    "resolve",
    "plugin"
  ],
  "dependencies": {
    "resolve": "^1.20.0"
  },
  "author": "Your Name",
  "license": "MIT"
}
