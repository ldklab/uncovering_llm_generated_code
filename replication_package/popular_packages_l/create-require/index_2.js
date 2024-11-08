const path = require('path');
const Module = require('module');

function createRequire(filename) {
  if (typeof filename === 'string') {
    filename = path.resolve(filename);
  } else if (filename instanceof URL) {
    filename = path.fileURLToPath(filename);
  } else {
    throw new TypeError('filename must be a string or a URL');
  }

  const mod = new Module(filename);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));

  const requireWrapper = (request) => mod.require(request);

  requireWrapper.resolve = (request) => Module._resolveFilename(request, mod);
  requireWrapper.main = require.main;
  requireWrapper.extensions = Module._extensions;
  requireWrapper.cache = Module._cache;

  return requireWrapper;
}

module.exports = createRequire;
