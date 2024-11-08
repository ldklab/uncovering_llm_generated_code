const { createRequire } = require("node:module");
const _createJiti = require("../dist/jiti.cjs");
const transform = require("../dist/babel.cjs");

function onError(err) {
  throw err; // Throws the error to output the stack trace for debugging
}

const nativeImport = (id) => import(id); // Uses dynamic import to load modules

function createJiti(id, opts = {}) {
  // If no transform function is provided, use the imported transform
  if (!opts.transform) {
    opts = { ...opts, transform };
  }
  // Return a new Jiti instance with provided id, options, and additional properties
  return _createJiti(id, opts, {
    onError,
    nativeImport,
    createRequire,
  });
}

// Export the createJiti function as a default and named export
module.exports = createJiti;
module.exports.createJiti = createJiti;
