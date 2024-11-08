const path = require('path');
const Module = require('module');

function createRequire(filename) {
  // Ensure filename is a path string or convert URL to string
  if (typeof filename === 'string') {
    filename = path.resolve(filename);
  } else if (filename instanceof URL) {
    filename = path.fileURLToPath(filename);
  } else {
    throw new TypeError('filename must be a string or a URL');
  }

  // Create a Node.js Module instance for this filename
  const mod = new Module(filename);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  
  // Custom require function
  function requireWrapper(request) {
    return mod.require(request);
  }
  
  // Set properties on the custom require function
  requireWrapper.resolve = (request) => Module._resolveFilename(request, mod);
  requireWrapper.main = require.main;
  requireWrapper.extensions = Module._extensions;
  requireWrapper.cache = Module._cache;
  
  return requireWrapper;
}

module.exports = createRequire;
