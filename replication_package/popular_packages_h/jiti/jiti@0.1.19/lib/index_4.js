let dynamicImport;

// Attempt to load dynamic import functionality
try {
  dynamicImport = require('./esm').dynamicImport;
} catch (_err) {
  // Ignore if there's an error loading dynamic import due to unsupported syntax
}

// Function to handle errors
function onError(err) {
  throw err; // Re-throw the error to utilize the stack trace
}

// Export a function that takes a filename and options object as parameters
module.exports = function (filename, opts) {
  // Load caching and requirement optimization modules
  require('../dist/v8cache');
  const jiti = require('../dist/jiti');

  // Merge provided options with default settings
  opts = {
    dynamicImport,
    onError,
    ...opts
  };

  // Default to a transformation function if none is provided
  if (!opts.transform) {
    opts.transform = require('../dist/babel');
  }

  // Call the jiti function with filename and options, returning its result
  return jiti(filename, opts);
};
