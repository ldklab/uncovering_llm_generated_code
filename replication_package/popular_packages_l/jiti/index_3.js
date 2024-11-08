const fs = require('fs');
const { transformSync } = require('@babel/core');
const path = require('path');

function createJiti(filename, options = {}) {
  const defaultOptions = {
    debug: false,
    fsCache: true,
    moduleCache: true,
    sourceMaps: false,
    interopDefault: true,
    alias: {},
    jsx: false,
  };
  options = { ...defaultOptions, ...options };

  const cache = {};

  function jitiRequire(filePath) {
    if (cache[filePath]) {
      return cache[filePath].exports;
    }

    const absPath = path.resolve(path.dirname(filename), filePath);
    const code = fs.readFileSync(absPath, 'utf-8');

    const babelPresets = [
      options.jsx ? ['@babel/preset-react'] : '',
      '@babel/preset-typescript',
    ].filter(Boolean);

    const transformed = transformSync(code, {
      filename: absPath,
      presets: babelPresets,
      sourceMaps: options.sourceMaps,
    });

    const module = { exports: {} };
    const functionWrapper = new Function('require', 'exports', 'module', transformed.code);
    functionWrapper(jitiRequire, module.exports, module);

    cache[filePath] = module;
    return module.exports;
  }

  jitiRequire.import = async function(filePath) {
    return jitiRequire(filePath);
  };

  jitiRequire.esmResolve = function(filePath) {
    return path.resolve(path.dirname(filename), filePath);
  };

  jitiRequire.resolve = jitiRequire.esmResolve;

  // Additional logic could be added here to handle other options like debug, interopDefault, and module caching.

  return jitiRequire;
}

module.exports = { createJiti };
