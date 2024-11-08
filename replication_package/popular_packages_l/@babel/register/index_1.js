const fs = require('fs');
const path = require('path');
const { transformSync } = require('@babel/core');

// Initialize a cache to store transformed code for modules
const cache = {};

// Function to hook into Node.js's require mechanism and transform files using Babel
function babelRegister({ extensions = ['.js', '.jsx'], babelOptions = {} }) {
  // Store the original .js require handler
  const originalRequire = require.extensions['.js'];

  // Override require handlers for specified extensions
  extensions.forEach(ext => {
    require.extensions[ext] = function (module, filename) {
      // Check if the file is already cached
      if (!cache[filename]) {
        // Read the original source code of the module
        const content = fs.readFileSync(filename, 'utf8');
        // Use Babel to transform the module's source code
        const result = transformSync(content, { ...babelOptions, filename });
        // Store the transformed code in the cache
        cache[filename] = result.code;
      }

      // Compile and execute the transformed source code
      module._compile(cache[filename], filename);
    };
  });

  // Restore the original require handler for .js extensions when the process exits
  process.on('exit', () => {
    require.extensions['.js'] = originalRequire;
  });
}

// Export a function that sets up the Babel require hook using the provided options
module.exports = function (options) {
  babelRegister(options || {});
};
