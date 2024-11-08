let dynamicImport;

try {
  // Attempt to load dynamicImport from an ES module
  dynamicImport = require('./esm').dynamicImport;
} catch (_err) {
  // If it fails, do nothing (possibly due to syntax incompatibility)
}

// Function to handle errors
function onError(err) {
  throw err; // Rethrow the error to generate a stack trace
}

// Export a function that accepts filename and options
module.exports = function(filename, opts) {
  // Load caching module
  require('../dist/v8cache');
  
  // Load the jiti module
  const jiti = require('../dist/jiti');
  
  // Merge dynamicImport and onError into options
  opts = { dynamicImport, onError, ...opts };
  
  // If transform option is not set, use a default Babel transform
  if (!opts.transform) {
    opts.transform = require('../dist/babel');
  }
  
  // Execute and return the result of jiti with the filename and options
  return jiti(filename, opts);
}
