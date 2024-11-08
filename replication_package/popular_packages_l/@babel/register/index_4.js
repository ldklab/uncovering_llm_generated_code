const fs = require('fs');
const path = require('path');
const { transformSync } = require('@babel/core');

// Cache to store compiled modules
const cache = {};

// Function to intercept and compile required modules using Babel
function babelRegister({ extensions = ['.js', '.jsx'], babelOptions = {} }) {
  // Store the default '.js' require extension handler
  const originalJsHandler = require.extensions['.js'];

  // Override require handling for specified extensions
  extensions.forEach(extension => {
    require.extensions[extension] = (module, filename) => {
      // Utilize Node.js's _compile function to process modules

      // Check if the module is already cached
      if (!cache[filename]) {
        const fileContent = fs.readFileSync(filename, 'utf8');
        const transformedCode = transformSync(fileContent, { ...babelOptions, filename });
        cache[filename] = transformedCode.code;
      }

      // Use cached compiled code to load the module
      module._compile(cache[filename], filename);
    };
  });

  // Restore the original '.js' extension handler when the process exits
  process.on('exit', () => {
    require.extensions['.js'] = originalJsHandler;
  });
}

// Export a function to set up the Babel require hook
module.exports = function (options) {
  babelRegister(options || {});
};
