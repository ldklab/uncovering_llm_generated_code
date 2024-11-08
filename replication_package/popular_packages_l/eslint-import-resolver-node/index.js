// index.js
const resolve = require('resolve');

function nodeResolver(customOptions = {}) {
  const defaultOptions = {
    extensions: ['.js'],
    paths: [],
    moduleDirectory: ['node_modules'],
  };

  const options = {
    ...defaultOptions,
    ...customOptions,
  };

  return {
    interfaceVersion: 2,
    resolve(source, file, config) {
      const opts = {
        ...options,
        // resolve allows specifying file being resolved from
        basedir: file ? file.substring(0, file.lastIndexOf('/')) : process.cwd(),
      };

      try {
        return {
          found: true,
          path: resolve.sync(source, opts),
        };
      } catch (err) {
        return {
          found: false,
        };
      }
    },
  };
}

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
