const fs = require('fs');
const { transformSync } = require('@babel/core');
const path = require('path');

function createJiti(filename, options = {}) {
  // Set default options and merge with user-provided options
  options = {
    debug: false,
    fsCache: true,
    moduleCache: true,
    sourceMaps: false,
    interopDefault: true,
    alias: {},
    jsx: false,
    ...options,
  };

  const cache = {}; // Cache for modules

  function jitiRequire(filePath) {
    // Return cached module if available
    if (cache[filePath]) {
      return cache[filePath].exports;
    }

    // Resolve full path and read file content
    const absPath = path.resolve(path.dirname(filename), filePath);
    const code = fs.readFileSync(absPath, 'utf-8');

    // Transform code with Babel
    const transformed = transformSync(code, {
      filename: absPath,
      presets: [
        options.jsx ? ['@babel/preset-react'] : '',
        '@babel/preset-typescript',
      ].filter(Boolean),
      sourceMaps: options.sourceMaps,
    });

    // Compile and execute transformed code in a module context
    const module = { exports: {} };
    const functionWrapper = new Function('require', 'exports', 'module', transformed.code);
    functionWrapper(jitiRequire, module.exports, module);

    // Cache the module exports
    cache[filePath] = module;
    return module.exports;
  }

  // Asynchronous import method
  jitiRequire.import = async function(filePath) {
    return jitiRequire(filePath);
  };

  // Resolve method for ESM and normalization
  jitiRequire.esmResolve = function(filePath) {
    return path.resolve(path.dirname(filename), filePath);
  };

  jitiRequire.resolve = jitiRequire.esmResolve;

  return jitiRequire; // Return customized require function
}

module.exports = { createJiti };
