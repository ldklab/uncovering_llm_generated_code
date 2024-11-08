// index.js
const Module = require('module');
const originalLoad = Module._load;

function addHook(hook, options = {}) {
  // Extract options with default values
  const matcher = options.matcher || (() => true);
  const allowedExtensions = options.exts || ['.js'];
  const excludeNodeModules = options.ignoreNodeModules !== undefined ? options.ignoreNodeModules : true;

  // Determine if the hook should be applied to the file
  const shouldHook = (filename) => {
    if (excludeNodeModules && /node_modules/.test(filename)) {
      return false;
    }
    return matcher(filename);
  };

  // Custom module loader
  function loader(module, filename) {
    const fileExtension = `.${filename.split('.').pop()}`;
    
    // Check if the file should be processed by the hook
    if (allowedExtensions.includes(fileExtension) && shouldHook(filename)) {
      const originalCompile = module._compile;
      module._compile = function (sourceCode, filename) {
        const transformedCode = hook(sourceCode, filename);
        return originalCompile.call(this, transformedCode, filename);
      };
    }
    
    // Load the module using the original loader
    return originalLoad.apply(this, arguments);
  }

  // Override the default module loading behavior
  Module._load = loader;

  // Return a function to revert the changes to the original state
  return function revertLoader() {
    Module._load = originalLoad;
  };
}

module.exports.addHook = addHook;
