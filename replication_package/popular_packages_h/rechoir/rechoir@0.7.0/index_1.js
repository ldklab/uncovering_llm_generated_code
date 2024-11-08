const path = require('path');

const extension = require('./lib/extension');
const normalize = require('./lib/normalize');
const register = require('./lib/register');

exports.prepare = function(extensions, filepath, cwd = null, nothrow = false) {
  let config, usedExtension, err;
  const attempts = [];
  let onlyErrors = true;
  const exts = extension(filepath);

  // Find the first valid configuration for the given file extension
  if (exts) {
    exts.some((ext) => {
      usedExtension = ext;
      config = normalize(extensions[ext]);
      return config != null;
    });
  }

  // Check if an extension is already registered
  if (Object.keys(require.extensions).includes(usedExtension)) {
    return true;
  }

  // Handle case where no config is found
  if (!config) {
    if (nothrow) {
      return;
    }
    throw new Error(`No module loader found for "${usedExtension}".`);
  }

  // Resolve cwd if it wasn't specified
  if (!cwd) {
    cwd = path.dirname(path.resolve(filepath));
  }
  
  // Ensure config is an array
  if (!Array.isArray(config)) {
    config = [config];
  }

  // Attempt to register each configuration
  for (const option of config) {
    const attemptResult = register(cwd, option.module, option.register);
    const error = attemptResult instanceof Error ? attemptResult : null;
    attempts.push({ moduleName: option.module, module: attemptResult, error });

    if (error) {
      continue; // Move to next attempt if there is an error
    }

    onlyErrors = false;
    break; // Break if a module was registered successfully
  }

  // Handling the case where all registration attempts failed
  if (onlyErrors) {
    err = new Error(`Unable to use specified module loaders for "${usedExtension}".`);
    err.failures = attempts;
    if (nothrow) {
      return err;
    }
    throw err;
  }

  return attempts;
};
