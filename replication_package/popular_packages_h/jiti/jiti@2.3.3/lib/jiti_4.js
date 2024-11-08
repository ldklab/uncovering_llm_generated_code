const { createRequire } = require("node:module");
const jitiFactory = require("../dist/jiti.cjs");
const defaultTransform = require("../dist/babel.cjs");

function handleError(error) {
  throw error; // Enables stack trace analysis
}

const dynamicImport = (moduleId) => import(moduleId);

function initializeJiti(moduleId, options = {}) {
  if (!options.transform) {
    options = { ...options, transform: defaultTransform };
  }
  return jitiFactory(moduleId, options, {
    onError: handleError,
    nativeImport: dynamicImport,
    createRequire,
  });
}

module.exports = initializeJiti;
module.exports.initializeJiti = initializeJiti;
