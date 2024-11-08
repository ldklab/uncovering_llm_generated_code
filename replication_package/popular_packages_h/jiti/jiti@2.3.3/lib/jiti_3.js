const { createRequire } = require("node:module");
const jiti = require("../dist/jiti.cjs");
const babelTransform = require("../dist/babel.cjs");

function handleError(err) {
  throw err; // Pass the error for stack trace inspection
}

const dynamicImport = async (id) => import(id);

function initializeJiti(id, options = {}) {
  if (!options.transform) {
    options = { ...options, transform: babelTransform };
  }
  return jiti(id, options, {
    onError: handleError,
    nativeImport: dynamicImport,
    createRequire,
  });
}

module.exports = initializeJiti;
module.exports.initializeJiti = initializeJiti;
