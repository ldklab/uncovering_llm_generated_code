const fs = require('fs');
const { transformSync } = require('@babel/core');
const path = require('path');

function createJiti(filename, options = {}) {
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

  const cache = {};

  function jitiRequire(filePath) {
    if (cache[filePath]) {
      return cache[filePath].exports;
    }

    const absPath = path.resolve(path.dirname(filename), filePath);
    const code = fs.readFileSync(absPath, 'utf-8');

    const transformed = transformSync(code, {
      filename: absPath,
      presets: [
        options.jsx ? ['@babel/preset-react'] : '',
        '@babel/preset-typescript',
      ].filter(Boolean),
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

  // Additional logic for options like debug, interopDefault, and caching.

  return jitiRequire;
}

module.exports = { createJiti };
```

## Usage Note

To use `jiti`, create an instance using `createJiti` by providing the context of the current script's path. Use the `import` method for asynchronous module import as TypeScript or native ESM syntax. A key feature is managing caching for faster performance and providing seamless compatibility across module resolutions. Options like `debug` can help trace the execution flow for better debugging.
```