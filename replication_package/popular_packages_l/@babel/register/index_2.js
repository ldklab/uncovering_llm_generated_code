const fs = require('fs');
const path = require('path');
const { transformSync } = require('@babel/core');

// A cache object to store the transformed module content
const cache = {};

// Function to set up Babel to compile required files
function babelRegister({ extensions = ['.js', '.jsx'], babelOptions = {} }) {
  const originalJsRequire = require.extensions['.js'];

  // Extending the require system to transform files
  extensions.forEach(extension => {
    require.extensions[extension] = (module, filename) => {
      const _compile = module._compile;

      // Check the cache first
      if (!cache[filename]) {
        const sourceCode = fs.readFileSync(filename, 'utf8');
        const transformed = transformSync(sourceCode, { ...babelOptions, filename });
        cache[filename] = transformed.code;
      }

      // Use the transformed code
      module._compile(cache[filename], filename);
    };
  });

  // Restore the original require system for .js on process exit
  process.on('exit', () => {
    require.extensions['.js'] = originalJsRequire;
  });
}

// Export a function to allow users to apply Babel require hook with options
module.exports = function(options) {
  babelRegister(options || {});
};
