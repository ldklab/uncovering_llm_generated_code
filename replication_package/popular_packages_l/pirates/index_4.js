// index.js
const Module = require('module');
const originalLoad = Module._load;

function addHook(hook, options = {}) {
  // Set up options with defaults
  const {
    matcher = () => true,           // Matches all files by default
    exts = ['.js'],                 // Default extensions to hook
    ignoreNodeModules = true        // Ignore 'node_modules' by default
  } = options;

  // Determine if a file should be hooked based on options
  const shouldHook = (filename) => {
    return !ignoreNodeModules || !filename.includes('node_modules') && matcher(filename);
  };

  // Custom module loader with added hook functionality
  function customLoader(module, filename) {
    const extension = `.${filename.split('.').pop()}`;
    if (exts.includes(extension) && shouldHook(filename)) {
      const originalCompile = module._compile;
      module._compile = function (sourceCode, filename) {
        const modifiedCode = hook(sourceCode, filename);
        return originalCompile.call(this, modifiedCode, filename);
      };
    }
    return originalLoad.apply(this, arguments);
  }

  // Override Node.js module loading with custom loader
  Module._load = customLoader;

  // Function to revert back to the original module loading
  return function revert() {
    Module._load = originalLoad;
  };
}

module.exports.addHook = addHook;
