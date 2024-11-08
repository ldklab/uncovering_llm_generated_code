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
  
  const moduleCache = new Map();

  function jitiRequire(filePath) {
    if (moduleCache.has(filePath)) {
      return moduleCache.get(filePath).exports;
    }

    const absolutePath = path.resolve(path.dirname(filename), filePath);
    const sourceCode = fs.readFileSync(absolutePath, 'utf-8');

    const { code } = transformSync(sourceCode, {
      filename: absolutePath,
      presets: [
        options.jsx ? ['@babel/preset-react'] : '',
        '@babel/preset-typescript',
      ].filter(Boolean),
      sourceMaps: options.sourceMaps,
    });

    const module = { exports: {} };
    const moduleWrapper = new Function('require', 'exports', 'module', code);
    moduleWrapper(jitiRequire, module.exports, module);

    moduleCache.set(filePath, module);
    return module.exports;
  }

  jitiRequire.import = async function(filePath) {
    return jitiRequire(filePath);
  };

  jitiRequire.esmResolve = function(filePath) {
    return path.resolve(path.dirname(filename), filePath);
  };

  jitiRequire.resolve = jitiRequire.esmResolve;

  // Potential integration for handling options like debug, interopDefault, etc.

  return jitiRequire;
}

module.exports = { createJiti };
