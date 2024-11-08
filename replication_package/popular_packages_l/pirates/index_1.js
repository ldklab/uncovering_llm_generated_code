// index.js
const Module = require('module');
const originalLoad = Module._load;

/**
 * Adds a hook to intercept and potentially transform module code during loading.
 * 
 * @param {Function} hook - A function that takes code and filename and returns transformed code.
 * @param {Object} [opts={}] - Options to configure the hook behavior.
 * @param {Function} [opts.matcher=()=>true] - A function to determine if a file should be hooked.
 * @param {Array} [opts.exts=['.js']] - List of file extensions to consider for hooking.
 * @param {boolean} [opts.ignoreNodeModules=true] - Whether to ignore files inside `node_modules`.
 * 
 * @returns {Function} Reverts the hooking behavior when called.
 */
function addHook(hook, opts = {}) {
  const {
    matcher = () => true,
    exts = ['.js'],
    ignoreNodeModules = true,
  } = opts;

  // Function to determine if the given filename should be processed by the hook
  const shouldHook = (filename) => {
    if (ignoreNodeModules && /node_modules/.test(filename)) {
      return false;
    }
    return matcher(filename);
  };

  // Custom loader to intercept module loading and apply the hook
  function loader(module, filename) {
    const ext = `.${filename.split('.').pop()}`;
    if (exts.includes(ext) && shouldHook(filename)) {
      const originalCompile = module._compile;

      // Overwrite the module's _compile function to transform the code
      module._compile = function (code, filename) {
        const transformedCode = hook(code, filename);
        return originalCompile.call(this, transformedCode, filename);
      };
    }
    return originalLoad.apply(this, arguments);
  }

  // Set the custom loader to be used by the module system
  Module._load = loader;

  // Return a function that can be used to revert the changes to Module._load
  return function revert() {
    Module._load = originalLoad;
  };
}

module.exports.addHook = addHook;
