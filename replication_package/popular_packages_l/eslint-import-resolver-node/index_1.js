// index.js
const resolve = require('resolve');

function createNodeResolver(customOptions = {}) {
  const defaultResolveOptions = {
    extensions: ['.js'],
    paths: [],
    moduleDirectory: ['node_modules'],
  };

  const mergeOptions = {
    ...defaultResolveOptions,
    ...customOptions,
  };

  return {
    interfaceVersion: 2,
    resolve(source, filename, config) {
      const resolveOptions = {
        ...mergeOptions,
        basedir: filename ? filename.substring(0, filename.lastIndexOf('/')) : process.cwd(),
      };

      try {
        const resolvedPath = resolve.sync(source, resolveOptions);
        return {
          found: true,
          path: resolvedPath,
        };
      } catch (error) {
        return { found: false };
      }
    },
  };
}

module.exports = { createNodeResolver };

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
