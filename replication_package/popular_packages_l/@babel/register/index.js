const fs = require('fs');
const path = require('path');
const { transformSync } = require('@babel/core');

// Cache for module compilation results
const cache = {};

// Hook into Node.js require system
function babelRegister({ extensions = ['.js', '.jsx'], babelOptions = {} }) {
  // Save original require
  const originalRequire = require.extensions['.js'];

  // Override the require extensions
  extensions.forEach(ext => {
    require.extensions[ext] = function (module, filename) {
      // Read module content
      const _compile = module._compile;

      if (!cache[filename]) {
        const content = fs.readFileSync(filename, 'utf8');
        const result = transformSync(content, { ...babelOptions, filename });
        cache[filename] = result.code;
      }

      // Compile the transformed code
      module._compile(cache[filename], filename);
    };
  });

  // Restore original require if needed
  process.on('exit', () => {
    require.extensions['.js'] = originalRequire;
  });
}

// Export a simple interface to initialize the require hook
module.exports = function (options) {
  babelRegister(options || {});
};
