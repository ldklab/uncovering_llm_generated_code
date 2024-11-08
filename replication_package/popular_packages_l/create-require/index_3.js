const path = require('path');
const Module = require('module');

function createRequire(filename) {
  // Convert filename to path if it's a URL, else resolve string to absolute path
  if (typeof filename === 'string') {
    filename = path.resolve(filename);
  } else if (filename instanceof URL) {
    filename = path.fileURLToPath(filename);
  } else {
    throw new TypeError('filename must be a string or a URL');
  }

  // Create a new Module for the given filename
  const mod = new Module(filename);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename)); // Setup module paths

  // Custom require function that wraps the module's require method
  function requireWrapper(request) {
    return mod.require(request);
  }

  // Attach the resolve method to mimic default require behaviors
  requireWrapper.resolve = function(request) {
    return Module._resolveFilename(request, mod);
  };

  // Attach additional properties to the custom require function
  requireWrapper.main = require.main;
  requireWrapper.extensions = Module._extensions;
  requireWrapper.cache = Module._cache;

  // Return the customized require function
  return requireWrapper;
}

module.exports = createRequire;
