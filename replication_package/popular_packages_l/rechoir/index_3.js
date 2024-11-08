const path = require('path');
const resolve = require('resolve');

/**
 * Prepares the environment to require a module with a specific file extension
 * by loading the necessary loaders or transpilers as per the provided configuration.
 *
 * @param {Object} config - An object mapping file extensions to their loader configurations.
 * @param {string} filepath - The path of the file requiring preparation for loading.
 * @param {string} [cwd=path.dirname(filepath)] - The current working directory for resolving modules.
 * @param {boolean} [noThrow=false] - Flag to prevent throwing exceptions when loaders are not found.
 * @returns {boolean} - Returns true if preparation succeeded, or false otherwise.
 */
function prepare(config, filepath, cwd = path.dirname(filepath), noThrow = false) {
  // Extract the file extension without the leading dot.
  const ext = path.extname(filepath).slice(1);
  
  // Retrieve the loader configurations for the file extension.
  const moduleLoaders = config[ext];

  // If no loaders are found for the extension and noThrow is false, throw an error.
  if (!moduleLoaders) {
    if (noThrow) return false;
    throw new Error(`No loader available for extension '${ext}'`);
  }

  // Initialize an array to collect errors encountered during loader registration.
  const errors = [];

  // Iterate over the list of potential module loaders for the extension.
  for (const moduleLoader of moduleLoaders) {
    try {
      // Resolve the module loader's path based on the current working directory.
      const modulePath = resolve.sync(moduleLoader.module, { basedir: cwd });
      
      // Require the resolved module.
      require(modulePath);
      
      // If a register function is available, call it to activate the loader.
      moduleLoader.register && moduleLoader.register();
      
      // Return true indicating successful preparation.
      return true;
    } catch (err) {
      // Capture the error encountered during require and store it in the errors array.
      errors.push({ module: moduleLoader.module, error: err });
    }
  }

  // If any errors occurred and noThrow is false, throw a collective error detailing failures.
  if (errors.length && !noThrow) {
    const error = new Error(`Failed to register module loaders for '${ext}'`);
    error.failures = errors;
    throw error;
  }

  // Return false as preparation was unsuccessful.
  return false;
}

module.exports = { prepare };

// Example usage:
//
// const interpretConfig = require('interpret').extensions;
// const rechoir = require('./rechoir'); // Adjust path to where this file is saved
// try {
//   rechoir.prepare(interpretConfig, './file.coffee');
//   console.log(require('./file.coffee')); // If supported and transpilers are installed
// } catch (error) {
//   console.error(error);
// }
