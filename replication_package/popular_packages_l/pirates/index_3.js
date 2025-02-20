// index.js
const Module = require('module');
const originalLoad = Module._load;

/**
 * Adds a hook into the module loading process.
 * @param {Function} hook - Function to process the module content.
 * @param {Object} opts - Options for the hook provided.
 * @param {Function} [opts.matcher] - Function to match files to which hook should be applied.
 * @param {Array} [opts.exts] - Array of extensions on which the hook should be applied.
 * @param {Boolean} [opts.ignoreNodeModules] - Whether to ignore node_modules when applying the hook.
 * @returns {Function} - Function to revert to the original module loader.
 */
function addHook(hook, opts = {}) {
  const matcher = opts.matcher || (() => true);
  const exts = opts.exts || ['.js'];
  const ignoreNodeModules = opts.ignoreNodeModules !== undefined ? opts.ignoreNodeModules : true;

  const shouldHook = (filename) => {
    if (ignoreNodeModules && /node_modules/.test(filename)) {
      return false;
    }
    return matcher(filename);
  };

  /**
   * Custom loader function that hooks into the module loading process.
   * @param {*} module - The module being loaded.
   * @param {string} filename - The name of the file being loaded.
   * @returns {*} - The result of the original module loading process.
   */
  function loader(module, filename) {
    const ext = `.${filename.split('.').pop()}`;
    if (exts.includes(ext) && shouldHook(filename)) {
      const _compile = module._compile;
      module._compile = function (code, filename) {
        const newCode = hook(code, filename);
        return _compile.call(this, newCode, filename);
      };
    }
    return originalLoad.apply(this, arguments);
  }

  // Overwrite Module._load with the custom loader.
  Module._load = loader;

  // Return a function that restores the original module loader.
  return function revert() {
    Module._load = originalLoad;
  };
}

module.exports.addHook = addHook;
