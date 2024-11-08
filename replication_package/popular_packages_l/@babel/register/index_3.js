const fs = require('fs');
const { transformSync } = require('@babel/core');

// Caching transformed modules
const transformedCache = {};

// Function to setup Babel require hooks
function setupBabelRequire({ extensions = ['.js', '.jsx'], babelOptions = {} }) {
  // Capture Node.js's default require for .js
  const defaultJsHandler = require.extensions['.js'];

  // Define new behavior for each supported extension
  extensions.forEach(ext => {
    require.extensions[ext] = (module, filename) => {
      // Use caching to store transformed code
      if (!transformedCache[filename]) {
        const rawCode = fs.readFileSync(filename, 'utf8');
        const { code: transformedCode } = transformSync(rawCode, { ...babelOptions, filename });
        transformedCache[filename] = transformedCode;
      }
      // Compile module with transformed code
      module._compile(transformedCache[filename], filename);
    };
  });

  // Register cleanup on process exit to restore the original .js handler
  process.on('exit', () => {
    require.extensions['.js'] = defaultJsHandler;
  });
}

// Export initialization function for setting up Babel hooks
module.exports = function (options) {
  setupBabelRequire(options || {});
};
