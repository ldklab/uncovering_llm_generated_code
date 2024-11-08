let dynamicImport;

try {
  dynamicImport = require('./esm').dynamicImport;
} catch (_err) {
  // Syntax is not supported, ignore the error
}

function handleError(err) {
  throw err; // Display stack trace for debugging
}

module.exports = function loadModule(filename, options) {
  require('../dist/v8cache');  // Import caching logic
  const jitiExecutor = require('../dist/jiti');  // Import jiti runtime

  options = { dynamicImport, onError: handleError, ...options };  // Extend options

  // Set default transformer if not provided
  if (!options.transform) {
    options.transform = require('../dist/babel');
  }

  return jitiExecutor(filename, options);  // Execute jiti with the supplied filename and options
};
