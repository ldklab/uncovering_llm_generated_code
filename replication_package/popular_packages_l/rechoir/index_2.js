const path = require('path');
const resolve = require('resolve');

/**
 * The function attempts to prepare and register module loaders based on file extensions
 * specified in a configuration object. If the required module loaders are available,
 * they are loaded and registered, allowing further operations like import or require.
 * 
 * @param {Object} config - An object mapping file extensions to module loaders.
 * @param {string} filepath - The file path from which the extension is derived.
 * @param {string} [cwd=path.dirname(filepath)] - Current working directory for module resolution.
 * @param {boolean} [noThrow=false] - If true, suppresses errors and returns false on failure.
 * @returns {boolean} - Returns true for successful preparation, false otherwise.
 */
function prepare(config, filepath, cwd = path.dirname(filepath), noThrow = false) {
  const ext = path.extname(filepath).slice(1); 
  const moduleLoaders = config[ext]; // Retrieve the loaders for the specific file extension.

  if (!moduleLoaders) { // If no loaders are found for the extension
    if (noThrow) return false; // Suppressed error scenario
    throw new Error(`No loader available for extension '${ext}'`); // Error if noThrow is false
  }

  const errors = [];

  for (const moduleLoader of moduleLoaders) { // Iterate over possible module loaders
    try {
      // Attempt to resolve the path of the module loader and require it.
      const modulePath = resolve.sync(moduleLoader.module, { basedir: cwd });
      require(modulePath);
      // If a register function is provided, it is called.
      moduleLoader.register && moduleLoader.register();
      return true; // Successfully loaded and registered a module
    } catch (err) {
      errors.push({ module: moduleLoader.module, error: err }); // Track errors for failed attempts
    }
  }

  if (errors.length && !noThrow) { // If errors occurred and errors are not suppressed
    const error = new Error(`Failed to register module loaders for '${ext}'`);
    error.failures = errors; // Attach all failure details to the error
    throw error; // Throw descriptive error with failure details
  }

  return false; // Return false if unable to register any module loader
}

module.exports = { prepare };

// Example usage to demonstrate how the `prepare` function can be called:
//
// const interpretConfig = require('interpret').extensions;
// const rechoir = require('./rechoir'); // Update the path to where this script is located
// try {
//   rechoir.prepare(interpretConfig, './file.coffee');
//   console.log(require('./file.coffee')); // Require file if loaders are successfully registered
// } catch (error) {
//   console.error(error); // Log any errors that occur during preparation
// }
