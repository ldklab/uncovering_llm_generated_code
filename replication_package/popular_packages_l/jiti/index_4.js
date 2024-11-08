const fs = require('fs');
const { transformSync } = require('@babel/core');
const path = require('path');

function createJiti(filename, userOptions = {}) {
  const options = {
    debug: false,
    fsCache: true,
    moduleCache: true,
    sourceMaps: false,
    interopDefault: true,
    alias: {},
    jsx: false,
    ...userOptions,
  };

  const cache = {};

  const jitiRequire = (filePath) => {
    if (cache[filePath]) {
      return cache[filePath].exports;
    }
    
    const absPath = path.resolve(path.dirname(filename), filePath);
    const code = fs.readFileSync(absPath, 'utf-8');
    const transformed = transformSync(code, {
      filename: absPath,
      presets: [
        options.jsx && '@babel/preset-react',
        '@babel/preset-typescript',
      ].filter(Boolean),
      sourceMaps: options.sourceMaps,
    });

    const module = { exports: {} };
    const functionWrapper = new Function('require', 'exports', 'module', transformed.code);
    functionWrapper(jitiRequire, module.exports, module);

    cache[filePath] = module;
    return module.exports;
  };

  jitiRequire.import = async (filePath) => jitiRequire(filePath);
  jitiRequire.esmResolve = (filePath) => path.resolve(path.dirname(filename), filePath);
  jitiRequire.resolve = jitiRequire.esmResolve;

  // Additional logic for handling debug, interopDefault, and caching not shown

  return jitiRequire;
}

module.exports = { createJiti };
